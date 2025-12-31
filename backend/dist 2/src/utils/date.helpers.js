"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.addDays = addDays;
exports.isToday = isToday;
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}
function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}
function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
//# sourceMappingURL=date.helpers.js.map