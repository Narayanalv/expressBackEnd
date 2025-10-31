-- CreateTable
CREATE TABLE `UserCred` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(300) NOT NULL,
    `password` VARCHAR(300) NOT NULL,
    `token` VARCHAR(300) NOT NULL,
    `name` VARCHAR(300) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserCred_email_key`(`email`),
    UNIQUE INDEX `UserCred_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(300) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserSession_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFav` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `title` VARCHAR(300) NOT NULL,
    `type` VARCHAR(300) NOT NULL,
    `director` VARCHAR(300) NOT NULL,
    `budget` VARCHAR(300) NOT NULL,
    `location` VARCHAR(300) NOT NULL,
    `duration` VARCHAR(300) NOT NULL,
    `time` VARCHAR(300) NOT NULL,
    `action` VARCHAR(300) NOT NULL,
    `image` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserCred`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFav` ADD CONSTRAINT `UserFav_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserCred`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
