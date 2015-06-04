export class OrderedSet<T> {
  items: Array<T> = [];
  
  constructor(public orderFn:(a:T, b:T) => number) {}
  
  setIfAbsent(item: T): T {
    return this._set(item, false);
  }
  
  set(item: T):T {
    return this._set(item, true);
  }

  
  private _set(item: T, replace: boolean):T {
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
    } else {
      items.splice(i, 0, item);    
    }
    return item;
  }
  
  
}

