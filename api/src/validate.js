module.exports['validate_order'] = function validate_order(order) {
    if (!order) return false;

    // Validating order info
    if (!order.bet_info) return false;
    if (isNaN(order.bet_info.bet_amount)) return false;
    if (isNaN(order.bet_info.bet_for_value)) return false;
    if (parseInt(order.bet_info.bet_amount) <= 0) return false;
    if (parseInt(order.bet_info.bet_for_value) <= 0) return false;

    // Validating user info
    if (!order.user_info) return false;
    if (!order.user_info.email) return false;

    return true;
}