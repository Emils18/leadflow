-- AlterTable
ALTER TABLE `leads` ADD COLUMN `barangay` VARCHAR(150) NULL,
    ADD COLUMN `business_type` VARCHAR(100) NOT NULL DEFAULT 'Others',
    ADD COLUMN `city` VARCHAR(150) NOT NULL DEFAULT '',
    ADD COLUMN `complete_address` TEXT NULL,
    ADD COLUMN `next_follow_up_date` DATETIME(3) NULL,
    ADD COLUMN `preferred_contact_method` VARCHAR(100) NULL,
    ADD COLUMN `province` VARCHAR(150) NULL,
    ADD COLUMN `social_media_url` VARCHAR(500) NULL,
    MODIFY `first_name` VARCHAR(100) NULL,
    MODIFY `last_name` VARCHAR(100) NULL,
    MODIFY `job_title` VARCHAR(150) NULL,
    MODIFY `phone` VARCHAR(50) NULL,
    MODIFY `website` VARCHAR(255) NULL;
