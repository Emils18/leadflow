-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 26, 2026 at 05:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `leadflow_crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `campaign_recipients`
--

CREATE TABLE `campaign_recipients` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `status` enum('pending','sent','delivered','opened','replied','failed') NOT NULL DEFAULT 'pending',
  `sent_at` datetime(3) DEFAULT NULL,
  `opened_at` datetime(3) DEFAULT NULL,
  `replied_at` datetime(3) DEFAULT NULL,
  `error_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `company_settings`
--

CREATE TABLE `company_settings` (
  `id` int(11) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `admin_email` varchar(150) NOT NULL,
  `timezone` varchar(100) NOT NULL DEFAULT 'UTC',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_campaigns`
--

CREATE TABLE `email_campaigns` (
  `id` int(11) NOT NULL,
  `campaign_name` varchar(200) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `body_html` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('draft','scheduled','sending','completed','cancelled') NOT NULL DEFAULT 'draft',
  `scheduled_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `sender_user_id` int(11) NOT NULL,
  `recipient_email` varchar(150) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body_html` text NOT NULL,
  `status` enum('draft','sent','delivered','opened','replied','failed') NOT NULL DEFAULT 'sent',
  `sent_at` datetime(3) DEFAULT NULL,
  `opened_at` datetime(3) DEFAULT NULL,
  `replied_at` datetime(3) DEFAULT NULL,
  `error_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL,
  `template_name` varchar(200) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body_html` text NOT NULL,
  `body_text` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `import_batches`
--

CREATE TABLE `import_batches` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(10) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `total_rows` int(11) NOT NULL,
  `imported_count` int(11) NOT NULL,
  `duplicate_count` int(11) NOT NULL,
  `failed_count` int(11) NOT NULL,
  `status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `import_batches`
--

INSERT INTO `import_batches` (`id`, `file_name`, `file_type`, `uploaded_by`, `total_rows`, `imported_count`, `duplicate_count`, `failed_count`, `status`, `created_at`) VALUES
(1, 'leadflow_template.csv', 'csv', 5, 1, 1, 0, 0, 'completed', '2026-06-24 12:57:37.590'),
(2, 'leadflow_template.csv', 'csv', 5, 1, 0, 1, 0, 'completed', '2026-06-24 17:19:52.463'),
(3, 'leadflow_template.csv', 'csv', 5, 1, 0, 1, 0, 'completed', '2026-06-24 17:31:41.505'),
(4, 'leadflow_template (1).csv', 'csv', 5, 1, 0, 1, 0, 'completed', '2026-06-24 17:31:50.498');

-- --------------------------------------------------------

--
-- Table structure for table `import_rows`
--

CREATE TABLE `import_rows` (
  `id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `row_number` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `raw_data` text NOT NULL,
  `import_status` enum('imported','duplicate','failed') NOT NULL,
  `error_message` text DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `import_rows`
--

INSERT INTO `import_rows` (`id`, `batch_id`, `row_number`, `email`, `raw_data`, `import_status`, `error_message`, `lead_id`) VALUES
(1, 1, 1, 'sarah@acmecorp.com', 'Sarah,Chen,Acme Corp,VP Marketing,sarah@acmecorp.com,+1 415 555 0100,USA', 'imported', NULL, 14),
(2, 2, 1, 'sarah@acmecorp.com', 'Sarah,Chen,Acme Corp,VP Marketing,sarah@acmecorp.com,+1 415 555 0100,USA', 'duplicate', 'Email already exists in database.', NULL),
(3, 3, 1, 'sarah@acmecorp.com', 'Sarah,Chen,Acme Corp,VP Marketing,sarah@acmecorp.com,+1 415 555 0100,USA', 'duplicate', 'Email already exists in database.', NULL),
(4, 4, 1, 'sarah@acmecorp.com', 'Sarah,Chen,Acme Corp,VP Marketing,sarah@acmecorp.com,+1 415 555 0100,USA', 'duplicate', 'Email already exists in database.', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `job_title` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `website` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL,
  `source_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `assigned_user_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `last_contacted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `first_name`, `last_name`, `company_name`, `job_title`, `email`, `phone`, `website`, `country`, `source_id`, `status_id`, `assigned_user_id`, `created_by`, `last_contacted_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(8, 'Emelio', 'Mondares', 'd', 'd', 'emeliomondares114@gmail.com', '09433346306', '', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 12:21:18.865', '2026-06-24 12:21:18.865', NULL),
(9, 'Emelio', 'Mondares', 'JVfames', 'e', 'emeliomondares14@gmail.com', '09433346306', '', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 12:26:58.808', '2026-06-24 12:26:58.808', NULL),
(10, 'Emelio', 'Mondares', 'JVfames', 'd', 'emeliomondares1114@gmail.com', '09433346306', 'd', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 12:33:01.571', '2026-06-24 12:33:01.571', NULL),
(11, 'Emelio', 'Mondares', 's', '1', 'emeliomondares11114@gmail.com', '09433346306', '', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 12:36:26.895', '2026-06-24 17:38:18.427', '2026-06-24 17:38:18.426'),
(12, 'RAYMOND', 'Mondares', 'JVfames', 'e', 'emeliomondares14131@gmail.com', '09433346306', 'e', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 12:38:21.335', '2026-06-24 12:38:21.335', NULL),
(13, 'Emelio', 'Mondares', 'JVfames', 'Software Engineer', 'emeliomondares3334@gmail.com', '09433346306', '', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 12:43:12.365', '2026-06-24 12:43:12.365', NULL),
(14, 'Sarah', 'Chen', 'Acme Corp', 'VP Marketing', 'sarah@acmecorp.com', '+1 415 555 0100', '', 'USA', 21, 35, 5, 5, NULL, '2026-06-24 12:57:37.595', '2026-06-24 17:40:54.413', NULL),
(15, 'Emelio', 'Mondares', 'JVfames', 'eee', 'emeliomondares14ee@gmail.com', '+639433346306', 'eee', 'Philippines', 21, 37, 5, 5, NULL, '2026-06-24 13:15:32.236', '2026-06-24 17:40:44.702', '2026-06-24 17:40:44.700'),
(16, 'RAYMOND', 'APAS', 'JVfames', 'Software', 'marievel.dejan@gmail.com', '954060846', 'https://www.youtube.com/', 'Philippines', 23, 35, 5, 5, NULL, '2026-06-24 17:20:44.531', '2026-06-24 17:40:47.764', '2026-06-24 17:40:47.762'),
(17, 'JV', 'APAS', 'JVfames', 'd', 'apasrain@gmail.com', '09433346306', 'd', 'Philippines', 21, 39, 5, 5, NULL, '2026-06-24 17:40:30.294', '2026-06-24 17:40:30.294', NULL),
(18, 'RAYMOND', 'APAS', 'JVfames', 'd', 'apeeasrain@gmail.com', '09433346306', 's', 'Philippines', 21, 33, 5, 5, NULL, '2026-06-24 17:50:38.319', '2026-06-24 17:50:38.319', NULL),
(19, 'Emelio', 'Mondares', 'JVfames', 'eee', 'emeliomondares14888@gmail.com', '09433346306', 'eee', 'Philippines', 23, 37, 5, 5, NULL, '2026-06-24 17:51:37.860', '2026-06-24 17:51:37.860', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_activities`
--

CREATE TABLE `lead_activities` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `activity_type` enum('created','updated','note','email_sent','email_opened','replied','demo_scheduled','converted','imported') NOT NULL,
  `description` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_activities`
--

INSERT INTO `lead_activities` (`id`, `lead_id`, `user_id`, `activity_type`, `description`, `created_at`) VALUES
(8, 8, 5, 'created', 'Lead registered manually: Emelio Mondares at d.', '2026-06-24 12:21:18.867'),
(9, 9, 5, 'created', 'Lead registered manually: Emelio Mondares at JVfames.', '2026-06-24 12:26:58.814'),
(10, 10, 5, 'created', 'Lead registered manually: Emelio Mondares at JVfames.', '2026-06-24 12:33:01.573'),
(11, 11, 5, 'created', 'Lead registered manually: Emelio Mondares at s.', '2026-06-24 12:36:26.902'),
(12, 12, 5, 'created', 'Lead registered manually: RAYMOND Mondares at JVfames.', '2026-06-24 12:38:21.337'),
(13, 13, 5, 'created', 'Lead registered manually: Emelio Mondares at JVfames.', '2026-06-24 12:43:12.369'),
(14, 14, 5, 'imported', 'Lead imported via Batch File Upload #1.', '2026-06-24 12:57:37.598'),
(15, 15, 5, 'created', 'Lead registered manually: Emelio Mondares at JVfames.', '2026-06-24 13:15:32.241'),
(16, 16, 5, 'created', 'Lead registered manually: RAYMOND APAS at JVfames.', '2026-06-24 17:20:44.534'),
(17, 11, 5, 'updated', 'Lead profile deleted from directory.', '2026-06-24 17:38:18.432'),
(18, 17, 5, 'created', 'Lead registered manually: JV APAS at JVfames.', '2026-06-24 17:40:30.296'),
(19, 15, 5, 'updated', 'Lead profile deleted from directory.', '2026-06-24 17:40:44.704'),
(20, 16, 5, 'updated', 'Lead profile deleted from directory.', '2026-06-24 17:40:47.766'),
(21, 14, 5, 'updated', 'Pipeline stage adjusted from \"New\" to \"Emailed\".', '2026-06-24 17:40:54.419'),
(22, 18, 5, 'created', 'Lead registered manually: RAYMOND APAS at JVfames.', '2026-06-24 17:50:38.322'),
(23, 19, 5, 'created', 'Lead registered manually: Emelio Mondares at JVfames.', '2026-06-24 17:51:37.861'),
(24, 17, 5, 'note', 'Internal CRM log note added.', '2026-06-24 17:55:08.382');

-- --------------------------------------------------------

--
-- Table structure for table `lead_notes`
--

CREATE TABLE `lead_notes` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `note` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_notes`
--

INSERT INTO `lead_notes` (`id`, `lead_id`, `user_id`, `note`, `created_at`, `updated_at`) VALUES
(1, 17, 5, 'ncie', '2026-06-24 17:55:08.380', '2026-06-24 17:55:08.380');

-- --------------------------------------------------------

--
-- Table structure for table `lead_sources`
--

CREATE TABLE `lead_sources` (
  `id` int(11) NOT NULL,
  `source_name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_sources`
--

INSERT INTO `lead_sources` (`id`, `source_name`, `description`) VALUES
(21, 'LinkedIn', 'Leads from LinkedIn outreach'),
(22, 'Website', 'Leads from landing page forms'),
(23, 'Referral', 'Leads from industry relationships'),
(24, 'Cold Email', 'Cold B2B email sequence targets'),
(25, 'Conference', 'In-person tech exhibitions');

-- --------------------------------------------------------

--
-- Table structure for table `lead_statuses`
--

CREATE TABLE `lead_statuses` (
  `id` int(11) NOT NULL,
  `status_name` varchar(50) NOT NULL,
  `display_order` int(11) NOT NULL,
  `color_hex` varchar(20) NOT NULL,
  `is_final` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_statuses`
--

INSERT INTO `lead_statuses` (`id`, `status_name`, `display_order`, `color_hex`, `is_final`) VALUES
(33, 'New', 1, '#3b82f6', 0),
(34, 'Not Emailed', 2, '#64748b', 0),
(35, 'Emailed', 3, '#06b6d4', 0),
(36, 'Replied', 4, '#a855f7', 0),
(37, 'Follow-up', 5, '#eab308', 0),
(38, 'Demo Scheduled', 6, '#f97316', 0),
(39, 'Converted', 7, '#22c55e', 1),
(40, 'Not Interested', 8, '#ef4444', 1);

-- --------------------------------------------------------

--
-- Table structure for table `lead_tags`
--

CREATE TABLE `lead_tags` (
  `id` int(11) NOT NULL,
  `tag_name` varchar(100) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_tag_map`
--

CREATE TABLE `lead_tag_map` (
  `lead_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `can_manage_leads` tinyint(1) NOT NULL DEFAULT 0,
  `can_send_email` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_users` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_settings` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`, `can_manage_leads`, `can_send_email`, `can_manage_users`, `can_manage_settings`, `created_at`, `updated_at`) VALUES
(9, 'Admin', 'System Admin: Dashboard, imports, setup and user privileges.', 1, 1, 1, 1, '2026-06-24 12:17:50.317', '2026-06-24 12:17:50.317'),
(10, 'Staff', 'Pipeline Agent: View and update target accounts.', 1, 1, 0, 0, '2026-06-24 12:17:50.320', '2026-06-24 12:17:50.320');

-- --------------------------------------------------------

--
-- Table structure for table `smtp_settings`
--

CREATE TABLE `smtp_settings` (
  `id` int(11) NOT NULL,
  `smtp_host` varchar(255) NOT NULL,
  `smtp_port` int(11) NOT NULL,
  `smtp_username` varchar(255) NOT NULL,
  `smtp_password_encrypted` text NOT NULL,
  `from_name` varchar(150) NOT NULL,
  `from_email` varchar(150) NOT NULL,
  `use_tls` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` text NOT NULL,
  `avatar_initials` varchar(5) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `first_name`, `last_name`, `email`, `password_hash`, `avatar_initials`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(5, 9, 'emelio', 'Innovations', 'emelio@cubetech.com', '$2b$10$zgAB1R.sQEPdWOvXc0xUk.FYQjo3xuBGW/J5RCOMa5O0KK3fio9sy', 'EI', 'active', '2026-06-25 12:34:07.793', '2026-06-24 12:17:50.386', '2026-06-25 12:34:07.795');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('076c62de-8a44-4d59-9e4c-44d752482d72', '9be900b8beb6a9d3148760e79cec1b83819ffebf995a9bd38e87da89c5f47b14', '2026-06-24 03:07:02.716', '20260624030701_init_leadflow_schema', NULL, NULL, '2026-06-24 03:07:01.782', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campaign_recipients`
--
ALTER TABLE `campaign_recipients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_recipients_campaign_id_fkey` (`campaign_id`),
  ADD KEY `campaign_recipients_lead_id_fkey` (`lead_id`);

--
-- Indexes for table `company_settings`
--
ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_campaigns`
--
ALTER TABLE `email_campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_campaigns_template_id_fkey` (`template_id`),
  ADD KEY `email_campaigns_created_by_fkey` (`created_by`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_logs_lead_id_fkey` (`lead_id`),
  ADD KEY `email_logs_campaign_id_fkey` (`campaign_id`),
  ADD KEY `email_logs_template_id_fkey` (`template_id`),
  ADD KEY `email_logs_sender_user_id_fkey` (`sender_user_id`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_templates_created_by_fkey` (`created_by`);

--
-- Indexes for table `import_batches`
--
ALTER TABLE `import_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_batches_uploaded_by_fkey` (`uploaded_by`);

--
-- Indexes for table `import_rows`
--
ALTER TABLE `import_rows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_rows_batch_id_fkey` (`batch_id`),
  ADD KEY `import_rows_lead_id_fkey` (`lead_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `leads_email_key` (`email`),
  ADD KEY `leads_source_id_fkey` (`source_id`),
  ADD KEY `leads_status_id_fkey` (`status_id`),
  ADD KEY `leads_assigned_user_id_fkey` (`assigned_user_id`),
  ADD KEY `leads_created_by_fkey` (`created_by`);

--
-- Indexes for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_activities_lead_id_fkey` (`lead_id`),
  ADD KEY `lead_activities_user_id_fkey` (`user_id`);

--
-- Indexes for table `lead_notes`
--
ALTER TABLE `lead_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_notes_lead_id_fkey` (`lead_id`),
  ADD KEY `lead_notes_user_id_fkey` (`user_id`);

--
-- Indexes for table `lead_sources`
--
ALTER TABLE `lead_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_sources_source_name_key` (`source_name`);

--
-- Indexes for table `lead_statuses`
--
ALTER TABLE `lead_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_statuses_status_name_key` (`status_name`);

--
-- Indexes for table `lead_tags`
--
ALTER TABLE `lead_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_tags_tag_name_key` (`tag_name`);

--
-- Indexes for table `lead_tag_map`
--
ALTER TABLE `lead_tag_map`
  ADD PRIMARY KEY (`lead_id`,`tag_id`),
  ADD KEY `lead_tag_map_tag_id_fkey` (`tag_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_role_name_key` (`role_name`);

--
-- Indexes for table `smtp_settings`
--
ALTER TABLE `smtp_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_role_id_fkey` (`role_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campaign_recipients`
--
ALTER TABLE `campaign_recipients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company_settings`
--
ALTER TABLE `company_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_campaigns`
--
ALTER TABLE `email_campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `import_batches`
--
ALTER TABLE `import_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `import_rows`
--
ALTER TABLE `import_rows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `lead_activities`
--
ALTER TABLE `lead_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `lead_notes`
--
ALTER TABLE `lead_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lead_sources`
--
ALTER TABLE `lead_sources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `lead_statuses`
--
ALTER TABLE `lead_statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `lead_tags`
--
ALTER TABLE `lead_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `smtp_settings`
--
ALTER TABLE `smtp_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `campaign_recipients`
--
ALTER TABLE `campaign_recipients`
  ADD CONSTRAINT `campaign_recipients_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `email_campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `campaign_recipients_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email_campaigns`
--
ALTER TABLE `email_campaigns`
  ADD CONSTRAINT `email_campaigns_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `email_campaigns_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `email_logs_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `email_campaigns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `email_logs_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `email_logs_sender_user_id_fkey` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `email_logs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD CONSTRAINT `email_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `import_batches`
--
ALTER TABLE `import_batches`
  ADD CONSTRAINT `import_batches_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `import_rows`
--
ALTER TABLE `import_rows`
  ADD CONSTRAINT `import_rows_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `import_batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `import_rows_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `lead_sources` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `lead_statuses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD CONSTRAINT `lead_activities_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `lead_notes`
--
ALTER TABLE `lead_notes`
  ADD CONSTRAINT `lead_notes_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_notes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `lead_tag_map`
--
ALTER TABLE `lead_tag_map`
  ADD CONSTRAINT `lead_tag_map_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_tag_map_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `lead_tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
