export const virtualListMiddleware = (...collections) => {
  const store = collections.reduce((acc, { name, renderMethod, updateMethod, data = [], buffer = 3 }) => {

    acc[name] = {
      target: undefined,
      containerHeight: 0,
      buffer,
      usedBuffer: 0,
      observer: undefined,
      observable: undefined,
      observableIndex: 0,
      sizeObserver: undefined,
      sizeObserverready: false,
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

        if ('attach' in step[collection.name]) {
          return next({ fn: () => {
            store[collection.name].target = document.querySelector(step[collection.name].attach);
            const  { height, top, bottom } = store[collection.name].target.getBoundingClientRect();

            store[collection.name].sizeObserver = new ResizeObserver(entries => {
              if (!store[collection.name].sizeObserverready) return;

              for (let entry of entries) {

                const index = entry.target.dataset.i;
                const elementHeight = entry. borderBoxSize[0].blockSize;
                store[collection.name].items[index].height = elementHeight;    

                for (let i = parseInt(index) + 1; i <= store[collection.name].endAt; i++) {
                  store[collection.name].items[i].y = (store[collection.name].items[i - 1].y + store[collection.name].items[i - 1].height);
                  document.querySelector(`[data-i="${i}"]`).style.transform = `translateY(${ store[collection.name].items[i].y }px)`;
                }
    
                store[collection.name].items[index].height = elementHeight;
              }
            });

            if (height === 0) throw new Error('Target element has no height');
            
            store[collection.name].containerHeight = height;
            store[collection.name].top = top;
            store[collection.name].bottom = bottom;
            const container = document.createElement('div');
            store[collection.name].target.append(container);
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

                    const firstElement = container.firstElementChild;

                    if (firstElement.getBoundingClientRect().bottom <= store[collection.name].top - store[collection.name].containerHeight) {
                      const itemHeight = firstElement.getBoundingClientRect().height;
                      store[collection.name].sizeObserver.unobserve(firstElement);
                      firstElement.remove();
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
                      element.setAttribute('data-i', item.i);

                      store[collection.name].sizeObserver.observe(element);
                      store[collection.name].updateMethod(element)({ ...item.data, index: item.i });
                    }
                  }

                  if (!scrollingDown) {

                    const lastElement = container.lastElementChild;

                    if (lastElement.getBoundingClientRect().top >= store[collection.name].bottom + store[collection.name].containerHeight) {
                      const itemHeight = lastElement.getBoundingClientRect().height;
                      const index = lastElement.dataset.i;
                      store[collection.name].sizeObserver.unobserve(lastElement);
                      lastElement.remove();
                      store[collection.name].endAt -= 1;
                      container.style.height = `${ store[collection.name].items[index -1].y + store[collection.name].items[index -1].height }px`;
                    }

                    while (container.firstElementChild.getBoundingClientRect().top > store[collection.name].top - store[collection.name].containerHeight) {

                      if (store[collection.name].startAt === 0) return;

                      const item = store[collection.name].items[store[collection.name].startAt -= 1];
                      template.innerHTML = store[collection.name].renderMethod(item.data);
                      const element = template.content.firstElementChild;
                      element.style.position = 'absolute';
                      container.prepend(template.content);
                      element.style.transform = `translateY(${ item.y }px)`;
                      element.setAttribute('data-i', item.i);

                      store[collection.name].sizeObserver.observe(element);
                      store[collection.name].updateMethod(element)({ ...item.data, index: item.i });
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
              container.append(template.content);
              item.height = element.getBoundingClientRect().height;
              item.y = i === 0 ? 0 : store[collection.name].items[i - 1].y + store[collection.name].items[i - 1].height;
              item.i = i;
              container.style.height = `${ item.y + item.height }px`;
              element.style.transform = `translateY(${ item.y }px)`;
              element.setAttribute('data-i', i);
              store[collection.name].updateMethod(element)({ ...item.data, index: i });

              if (i === 0) {
                store[collection.name].observer.observe(element);
                store[collection.name].observable = element;
              }

              store[collection.name].sizeObserver.observe(element);

              if (item.y + item.height >= store[collection.name].bottom + store[collection.name].containerHeight) {
                store[collection.name].endAt = i;
                store[collection.name].sizeObserverready = true;
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
