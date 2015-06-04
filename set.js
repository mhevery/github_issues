var OrderedSet = (function () {
    function OrderedSet(orderFn) {
        this.orderFn = orderFn;
        this.items = [];
    }
    OrderedSet.prototype.setIfAbsent = function (item) {
        return this._set(item, false);
    };
    OrderedSet.prototype.set = function (item) {
        return this._set(item, true);
    };
    OrderedSet.prototype._set = function (item, replace) {
        var items = this.items;
        var orderFn = this.orderFn;
        var i = 0, ii = items.length, order = 1;
        while (i < ii && (order = orderFn(item, items[i])) > 0) {
            i++;
        }
        if (order == 0) {
            if (replace)
                items[i] = item;
            else
                item = items[i];
        }
        else {
            items.splice(i, 0, item);
        }
        return item;
    };
    return OrderedSet;
})();
exports.OrderedSet = OrderedSet;
