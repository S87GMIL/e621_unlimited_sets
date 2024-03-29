class BackupReminderHelper {
    BACKUP_REMINDER_PERIOD = 30;

    BACKUP_INFO_KEY_PREFIX = "backupInformation_"

    constructor(userId) {
        if (!userId)
            throw Error("No user ID was passed!");

        this._userId = userId;
    }

    #getBackupInfo() {
        let backupinfo = StorageHelper.getValue(this.BACKUP_INFO_KEY_PREFIX + this._userId);
        if (!backupinfo) {
            const oldestSetDate = this.#getOldestSet().createdOn;
            backupinfo = {
                lastBackupDate: oldestSetDate,
                disableReminder: false,
                lastIgnoredAt: -1,
                backupReminderPeriod: this.BACKUP_REMINDER_PERIOD
            };
        }

        return backupinfo;
    }

    #getOldestSet() {
        return new CustomSetStorage(this._userId).getUserSets().reduce((pre, cur) => {
            return new Date(pre.createdOn) > new Date(cur.createdOn) ? cur : pre;
        });
    }

    #haveSetsChangedSinceLastBackup(lastBackup) {
        const lastChangedSet = new CustomSetStorage(this._userId).getUserSets().reduce((pre, cur) => {
            return new Date(pre.changedOn) < new Date(cur.changedOn) ? cur : pre;
        });

        return lastBackup < lastChangedSet.changedOn;
    }

    setReminderDisabled(disabled) {
        let backupInfo = this.#getBackupInfo();
        backupInfo.disableReminder = disabled;

        StorageHelper.saveValue(this.BACKUP_INFO_KEY_PREFIX + this._userId, backupInfo);
    }

    getReminderDisabled() {
        return this.#getBackupInfo().disableReminder;
    }

    setReminderPeriod(periodDays) {
        if (!periodDays)
            throw Error("No valid day amount was passed!");

        let backupInfo = this.#getBackupInfo();
        backupInfo.backupReminderPeriod = periodDays;

        StorageHelper.saveValue(this.BACKUP_INFO_KEY_PREFIX + this._userId, backupInfo);
    }

    getRemidnerPeriod() {
        return this.#getBackupInfo().backupReminderPeriod;
    }

    ignoreReminder() {
        let backupInfo = this.#getBackupInfo();
        backupInfo.lastIgnoredAt = Date.now();

        StorageHelper.saveValue(this.BACKUP_INFO_KEY_PREFIX + this._userId, backupInfo);
    }

    setLastBackupDate(date) {
        if (!date)
            throw Error("No valid date instance was passed!");

        StorageHelper.saveValue(this.BACKUP_INFO_KEY_PREFIX + this._userId, {
            lastBackupDate: typeof date === "object" ? date.getTime() : date
        });
    }

    getLastBackupDate() {
        const backupInfo = this.#getBackupInfo();
        if (!backupInfo || !backupInfo.lastBackupDate) {
            const oldestSetDate = new Date(this.#getOldestSet().createdOn);
            this.setLastBackupDate(oldestSetDate);
        }

        return new Date(this.#getBackupInfo().lastBackupDate);
    }

    isBackupOverdue() {
        const backupInfo = this.#getBackupInfo();
        if (backupInfo.disableReminder)
            return false;

        let lastBackup;
        const lastBackupDate = this.getLastBackupDate();
        if (backupInfo.lastIgnoredAt === -1) {
            lastBackup = lastBackupDate
        } else {
            lastBackup = backupInfo.lastIgnoredAt > lastBackupDate.getTime() ? new Date(backupInfo.lastIgnoredAt) : lastBackupDate;
        }

        if (!this.#haveSetsChangedSinceLastBackup(lastBackup))
            return false;

        const differenceDays = Math.round((Date.now() - lastBackup.getTime()) / (1000 * 3600 * 24));
        return differenceDays > backupInfo.backupReminderPeriod;
    }

    displayBackupReminder() {
        const daysSinceBackup = Math.round((Date.now() - this.getLastBackupDate().getTime()) / (1000 * 3600 * 24));
        const reminderMessage = `S87's offline sets: Reminder to backup you offline sets, last backup was ${daysSinceBackup} days ago <a href='/custom_sets/settings' style='float: right;' >Backup now</a>`;
        UIHelper.displayErrorMessage(reminderMessage, -1, true);
    }
}