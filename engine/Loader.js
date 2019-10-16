;(function () {
    'use strict';

    class Loader {
        constructor () {
            // объекты, которые загружаем
            this.loadOrder = {
                images: [],
                jsons: []
            };

            // ресурсы
            this.resources = {
                images: [],
                jsons: []
            };
        };

        // вызываются для экземпляра класса
        // добавление изображения в loadOrder (добавляет в очередь на загрузку)
        addImage (name, src) {
            this.loadOrder.images.push({ name, src });
        };

        // добавление json-объектов в loadOrder (добавляет в очередь на загрузку)
        addJson (name, address) {
            this.loadOrder.jsons.push({ name, address });
        };

        // загрузка изображений
        // callback-функция - функция - которая передается в качестве аргумента другой функции (в некоторых случаях можно называть handler)
        // будет вызвана после того, как все изображения и все json-файлы будут загружены
        load (callback) {
            const promises = [];
            // цикл по очереди загрузки изображений, по всем элементам images в loadOrder
            // { name, src } - деструктизация объекта, вытаскиваем свойства из объекта и используем их
            for (const imageData of this.loadOrder.images) {
                const { name, src } = imageData;

                const promise = Loader
                    .loadImage(src)
                    .then(image => { // подписка на результат promise
                        // когда изображение будет загружено, оно добавится в resources экземпляра класса
                        this.resources.images[name] = image; 

                        // удаляем запись о необходимости загрузки изображения из очереди загрузки (так как оно уже загружено)
                        if (this.loadOrder.images.includes(imageData)) {
                            const index = this.loadOrder.images.indexOf(imageData);
                            this.loadOrder.images.splice(index, 1);
                        };
                    });
                
                promises.push(promise);
            };

            // то же самое по json-объектам
            for (const jsonData of this.loadOrder.jsons) {
                const { name, address } = jsonData;

                const promise = Loader
                    .loadJson(address)
                    .then(image => { // подписка на результат promise
                        // когда изображение будет загружено, оно добавится в resources экземпляра класса
                        this.resources.jsons[name] = image; 

                        // удаляем запись о необходимости загрузки изображения из очереди загрузки (так как оно уже загружено)
                        if (this.loadOrder.jsons.includes(jsonData)) {
                            const index = this.loadOrder.jsons.indexOf(jsonData);
                            this.loadOrder.jsons.splice(index, 1);
                        };
                    });
                
                promises.push(promise);
            };


            // ждет, когда выполнятся все промисы
            // делегируем вызов функции другой функции
            Promise.all(promises).then(() => callback()); 
            // Promise.all(promises).then(callback); - сокращенный синтаксис
        };

        // статические методы (вызываются для класса, а не для экземпляра класса, как правило более универсальные и простые)
        // загрузка изображения
        static loadImage (src) {
            // Promise - структура, которая позволяет обернуть логику с асинхронным кодом
            // resolve вызывается в тот момент, когда нужный процесс был закончен
            // reject вызывается при ошибке
            // Promise принимает лямда-функцию, т. е. стрелочную функцию с двумя методами: resolve и reject
            return new Promise((resolve, reject) => {
                try {
                    const image = new Image; // загружаем изображение
                    image.onload = () => resolve(image); // реагируем на его загрузку
                    image.src = src; // путь для загрузки изображения
                }
                
                // реагируем на ошибку
                catch (err) {
                    reject(err);
                }
            });
        };

        // загрузка json-объектов
        static loadJson (address) {
            return new Promise((resolve, reject) => {
                // способ загрузить данные с сервера на клиент, возвращает promise
                fetch(address)
                    .then(result => result.json())
                    .then(result => resolve(result))
                    .catch(err => reject(err));
            });
        };
    };

    // необходимо для поключения нескольких классов
    window.GameEngine = window.GameEngine || {};
    window.GameEngine.Loader = Loader;
})();