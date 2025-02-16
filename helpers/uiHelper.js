class UIHelper {
    static SUCCESS_NOTICE_TYPE = "SUCCESS";
    static ERROR_NOTICE_TYPE = "ERROR";

    static #getNoticeElemente() {
        return document.getElementById("notice");
    }

    static #displayNotice(type, message, fadeAfter, isHtmlMessage = false) {
        let noticeElement = this.#getNoticeElemente();
        noticeElement.classList.remove(type === UIHelper.SUCCESS_NOTICE_TYPE ? "ui-state-error" : "ui-state-highlight");
        noticeElement.classList.add(type === UIHelper.SUCCESS_NOTICE_TYPE ? "ui-state-highlight" : "ui-state-error");

        noticeElement.style.display = "block";
        const messageSpan = noticeElement.querySelector("span");

        if (isHtmlMessage) {
            messageSpan.innerHTML = message;
        } else {
            messageSpan.innerText = message;
        }

        if (fadeAfter !== -1)
            setTimeout(() => {
                noticeElement.style.display = "none";
            }, fadeAfter * 1000);
    }

    static displaySuccessMessage(message, fadeAfter = 10, isHtmlMessage) {
        this.#displayNotice(UIHelper.SUCCESS_NOTICE_TYPE, message, fadeAfter, isHtmlMessage);
    }

    static displayErrorMessage(message, fadeAfter = -1, isHtmlMessage) {
        this.#displayNotice(UIHelper.ERROR_NOTICE_TYPE, message, fadeAfter, isHtmlMessage);
    }

    static substituteE6Image() {
        const logoBase64 = `data:image/png;base64,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`;
        document.querySelector("body > footer > div > span.footer-logo > a > img").src = logoBase64;
        document.querySelector("body > nav > menu.nav-logo > a").style.backgroundImage = `url('${logoBase64}')`;

    }
}