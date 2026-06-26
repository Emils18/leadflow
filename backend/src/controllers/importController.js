import prisma from '../utils/db.js';

export const handleCSVImport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  const text = req.file.buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length <= 1) {
    return res.status(400).json({ error: 'The uploaded CSV file contains no data rows.' });
  }

  // Parse Headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  const emailIdx = headers.indexOf('email');
  const firstIdx = headers.indexOf('first_name');
  const lastIdx = headers.indexOf('last_name');
  const companyIdx = headers.indexOf('company_name');
  const jobTitleIdx = headers.indexOf('job_title');
  const phoneIdx = headers.indexOf('phone');
  const countryIdx = headers.indexOf('country');

  if (emailIdx === -1 || firstIdx === -1 || lastIdx === -1 || companyIdx === -1) {
    return res.status(400).json({ 
      error: 'CSV headers must match: email, first_name, last_name, company_name' 
    });
  }

  const defaultStatus = await prisma.leadStatus.findFirst({ orderBy: { display_order: 'asc' } });
  const defaultSource = await prisma.leadSource.findFirst();

  if (!defaultStatus || !defaultSource) {
    return res.status(500).json({ error: 'Baseline pipeline configurations are missing. Please seed database.' });
  }

  // Initialize processing batch entry
  const batch = await prisma.importBatch.create({
    data: {
      file_name: req.file.originalname,
      file_type: 'csv',
      uploaded_by: req.user.id,
      total_rows: lines.length - 1,
      imported_count: 0,
      duplicate_count: 0,
      failed_count: 0,
      status: 'processing'
    }
  });

  let imported = 0;
  let duplicates = 0;
  let failed = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    
    // Parse commas while respecting quotes
    const columns = [];
    let quoted = false;
    let field = '';
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        columns.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    columns.push(field.trim());

    const email = columns[emailIdx]?.replace(/^["']|["']$/g, '');
    const first_name = columns[firstIdx]?.replace(/^["']|["']$/g, '');
    const last_name = columns[lastIdx]?.replace(/^["']|["']$/g, '');
    const company_name = columns[companyIdx]?.replace(/^["']|["']$/g, '');

    if (!email || !first_name || !last_name || !company_name) {
      failed++;
      await prisma.importRow.create({
        data: {
          batch_id: batch.id,
          row_number: i,
          email: email || 'unknown',
          raw_data: rawLine,
          import_status: 'failed',
          error_message: 'Row is missing required fields.'
        }
      });
      continue;
    }

    const match = await prisma.lead.findUnique({ where: { email } });
    if (match) {
      duplicates++;
      await prisma.importRow.create({
        data: {
          batch_id: batch.id,
          row_number: i,
          email,
          raw_data: rawLine,
          import_status: 'duplicate',
          error_message: 'Email already exists in database.'
        }
      });
      continue;
    }

    try {
      const job_title = jobTitleIdx !== -1 ? columns[jobTitleIdx]?.replace(/^["']|["']$/g, '') : '';
      const phone = phoneIdx !== -1 ? columns[phoneIdx]?.replace(/^["']|["']$/g, '') : '';
      const country = countryIdx !== -1 ? columns[countryIdx]?.replace(/^["']|["']$/g, '') : '';

      const newLead = await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            first_name,
            last_name,
            company_name,
            job_title: job_title || '',
            email,
            phone: phone || '',
            website: '',
            country: country || '',
            status_id: defaultStatus.id,
            source_id: defaultSource.id,
            assigned_user_id: req.user.id,
            created_by: req.user.id,
          }
        });

        await tx.leadActivity.create({
          data: {
            lead_id: lead.id,
            user_id: req.user.id,
            activity_type: 'imported',
            description: `Lead imported via Batch File Upload #${batch.id}.`
          }
        });

        return lead;
      });

      imported++;
      await prisma.importRow.create({
        data: {
          batch_id: batch.id,
          row_number: i,
          email,
          raw_data: rawLine,
          import_status: 'imported',
          lead_id: newLead.id
        }
      });
    } catch (err) {
      failed++;
      await prisma.importRow.create({
        data: {
          batch_id: batch.id,
          row_number: i,
          email,
          raw_data: rawLine,
          import_status: 'failed',
          error_message: err.message
        }
      });
    }
  }

  const finishedBatch = await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      imported_count: imported,
      duplicate_count: duplicates,
      failed_count: failed,
      status: 'completed'
    }
  });

  return res.json(finishedBatch);
};