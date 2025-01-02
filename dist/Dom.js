// src/Dom.ts
export class Dom {
    // Lấy thẻ HTMLElement hoặc document
    static get(id) {
        if (id instanceof HTMLElement || id === document) {
            return id;
        }
        return document.getElementById(id);
    }
    // Set innerHTML cho một phần tử
    static set(id, html) {
        const el = Dom.get(id);
        if (el !== document) {
            el.innerHTML = html;
        }
    }
    // Thêm sự kiện
    static on(ele, type, fn, capture) {
        Dom.get(ele).addEventListener(type, fn, capture);
    }
    // Bỏ sự kiện
    static un(ele, type, fn, capture) {
        Dom.get(ele).removeEventListener(type, fn, capture);
    }
    // Hiển thị phần tử
    static show(ele, displayType = 'block') {
        Dom.get(ele).style.display = displayType;
    }
    // Bỏ focus
    static blur(ev) {
        var _a;
        (_a = ev.target) === null || _a === void 0 ? void 0 : _a.blur();
    }
    // Thêm hoặc xóa className cho phần tử
    static toggleClassName(ele, name, on) {
        const element = Dom.get(ele);
        const classes = element.className.split(' ');
        const idx = classes.indexOf(name);
        if (typeof on === 'undefined') {
            on = (idx < 0);
        }
        if (on && idx < 0) {
            classes.push(name);
        }
        else if (!on && idx >= 0) {
            classes.splice(idx, 1);
        }
        element.className = classes.join(' ');
    }
}
// Lưu trữ localStorage (hoặc sessionStorage) tùy ý
Dom.storage = window.localStorage || {};
