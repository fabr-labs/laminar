export const virtualListMiddleware = (...collections) => {
  const store = collections.reduce((acc, { name, renderMethod, updateMethod, data = [], buffer = 3 }) => {

    acc[name] = {
      target: undefined,
      containerHeight: 0,
      buffer,
      usedBuffer: 0,
      pool: [],
      observer: undefined,
      observable: undefined,
      observableIndex: 0,
      height: 0,
      renderMethod,
      updateMethod,
      startAt: 0,
      endAt: 0,
      top: 0,
      bottom: 0,
      items: data.map((data) => ({
        data, 
        height: 0,
        i: 0,
        y: 0,
      })),
    }

    return acc;
  }, {});

  return (ctrl) => (next) => (step) => {

    for (const collection of collections) {
      if (step[collection.name]) {

        if (step[collection.name].prepend) {
          return next({ fn: () => { 
            store[collection.name].items.unshift(step[collection.name].prepend);
          }, ...step });
        };
        
        if (step[collection.name].append) {
          return next({ fn: () => {
            store[collection.name].items.push(step[collection.name].append);
          }, ...step });
        };

        if (step[collection.name].attach) {
          return next({ fn: () => {
            store[collection.name].target = document.querySelector(step[collection.name].attach);
            const  { height, top, bottom } = store[collection.name].target.getBoundingClientRect();

            if (height === 0) throw new Error('Target element has no height');
            
            store[collection.name].containerHeight = height;
            store[collection.name].top = top;
            store[collection.name].bottom = bottom;
            const container = document.createElement('div');
            store[collection.name].target.appendChild(container);
            const template = document.createElement('template');
            store[collection.name].observer = new IntersectionObserver(function(entries) {

              entries.forEach(function(entry) {

                if (entry.intersectionRatio === 0) {

                  const scrollingDown = entry.boundingClientRect.top < entry.rootBounds.top;
                  const next = scrollingDown ? entry.target.nextElementSibling : entry.target.previousElementSibling;

                  if (!next) return;
                  
                  store[collection.name].observer.unobserve(entry.target);
                  store[collection.name].observer.observe(next);

                  if (scrollingDown) {

                    const item = container.firstElementChild;

                    if (item.getBoundingClientRect().bottom <= store[collection.name].top - store[collection.name].containerHeight) {
                      const itemHeight = item.getBoundingClientRect().height;
                      item.remove();
                      store[collection.name].startAt += 1;
                    }

                    while (container.lastElementChild.getBoundingClientRect().bottom < store[collection.name].bottom + store[collection.name].containerHeight) {

                      if (!store[collection.name].items[store[collection.name].endAt + 1]) return;

                      const item = store[collection.name].items[store[collection.name].endAt += 1];
                      template.innerHTML = store[collection.name].renderMethod(item.data);
                      const element = template.content.firstElementChild;
                      element.style.position = 'absolute';
                      container.append(template.content);
                      item.height = item.height || element.getBoundingClientRect().height;
                      item.y = item.y || container.getBoundingClientRect().height;
                      item.i = item.i || store[collection.name].endAt;
                      container.style.height = `${ item.y + item.height }px`;
                      element.style.transform = `translateY(${ item.y }px)`;
                    }
                  }

                  if (!scrollingDown) {

                    const item = container.lastElementChild;

                    // console.log(item.getBoundingClientRect().top <= store[collection.name].bottom + store[collection.name].containerHeight);
                    // console.log(item.getBoundingClientRect().top, store[collection.name].bottom, store[collection.name].containerHeight);
                    // console.log(item);

                    if (item.getBoundingClientRect().top >= store[collection.name].bottom + store[collection.name].containerHeight) {
                      const itemHeight = item.getBoundingClientRect().height;
                      item.remove();
                      store[collection.name].endAt -= 1;
                    }

                    while (container.firstElementChild.getBoundingClientRect().top > store[collection.name].top - store[collection.name].containerHeight) {

                      // console.log(container.firstElementChild);
                      // console.log(container.firstElementChild.getBoundingClientRect().top, store[collection.name].top, store[collection.name].containerHeight)

                      if (store[collection.name].startAt === 0) return;

                      const item = store[collection.name].items[store[collection.name].startAt -= 1];

                      console.log(item);

                      template.innerHTML = store[collection.name].renderMethod(item.data);
                      const element = template.content.firstElementChild;
                      element.style.position = 'absolute';
                      container.prepend(template.content);
                      element.style.transform = `translateY(${ item.y }px)`;
                    }
                  }
                }
              });


              // store[collection.name].topObservable
            }, {
              root: store[collection.name].target,
              rootMargin: '0px',
              threshold: [0, 1],
            });

            store[collection.name].items.some((item, i) => {
              template.innerHTML = store[collection.name].renderMethod(item.data);
              const element = template.content.firstElementChild;
              element.style.position = 'absolute';
              container.appendChild(template.content);
              item.height = element.getBoundingClientRect().height;
              item.y = i === 0 ? 0 : store[collection.name].items[i - 1].y + store[collection.name].items[i - 1].height;
              item.i = i;
              container.style.height = `${ item.y + item.height }px`;
              element.style.transform = `translateY(${ item.y }px)`;

              if (i === 0) {
                store[collection.name].observer.observe(element);
                store[collection.name].observable = element;
              }

              store[collection.name].pool.push({
                element,
                updateMethod: store[collection.name].updateMethod(element),
              });

              console.log('limit', item.y + item.height, store[collection.name].bottom + store[collection.name].containerHeight);

              if (item.y + item.height >= store[collection.name].bottom + store[collection.name].containerHeight) {
                store[collection.name].endAt = i;
                return true;
              }
            });
          }, ...step });
        }
      }
    }

    return next(step);
  }
}
