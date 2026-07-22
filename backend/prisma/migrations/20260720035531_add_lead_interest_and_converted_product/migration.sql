-- AlterTable
ALTER TABLE `leads` ADD COLUMN `converted_product` VARCHAR(200) NULL,
    ADD COLUMN `interest_level` ENUM('cold', 'warm', 'hot') NOT NULL DEFAULT 'cold';
