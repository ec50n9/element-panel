class EcImage {
    element = document.createElement('img');
    attrs = {
        src: './img/dogs.jpeg',
        position: 'absolute',
        top: 10,
        left: 10,
        width: 100,
        height: 100,
        borderRadius: 0,
        opacity: 1
    };
    static inputsBinding = this;
    inputs = {};

    constructor() {
        this.element.ecObj = this;
        observe(this.attrs, this.element, this.inputs);
        update_object(this.attrs);
        this.element.addEventListener('webkitAnimationEnd', function(){
            this.className = '';
        }, false);
    }

    bindInputs(inputs) {
        EcImage.inputsBinding.inputs = {};
        EcImage.inputsBinding = this;
        let that = this;
        for (const input of inputs) {
            // 绑定监听器
            input.onchange = function () {
                const name = this.name;
                const value = this.value;
                // 设置当前值
                if (value.match(/^[0-9]+$/)) {
                    that.attrs[name] = Number(value);
                } else {
                    that.attrs[name] = value;
                }
            }
            // 字典存储
            this.inputs[input.name] = input;
        }
        update_object(this.attrs);
    }
}

function update_object(attrs) {
    for (const key in attrs) {
        if (typeof attrs[key] === 'object')
            update_object(attrs[key]);
        else
            attrs[key] = attrs[key];
    }
}

function observe(val, target, inputs) {
    if (typeof val === 'object') {
        for (const key in val) {
            defineReactive(val, key, val[key], target, inputs);
        }
    }
}

function defineReactive(obj, key, val, target, inputs) {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        get: function reactiveGetter() {
            return val;
        },
        set: function reactiveSetter(newValue) {
            // 更新元素值
            switch (key) {
                case 'left':
                case 'top':
                case 'width':
                case 'height':
                case 'borderRadius':
                    target.style[key] = newValue + 'px';
                    break;
                case 'position':
                case 'opacity':
                    target.style[key] = newValue;
                case 'src':
                    target[key] = newValue;
                    break;
                default:
                    break;
            }
            // 更新编辑框值
            if (inputs[key]) {
                inputs[key].value = newValue;
            }
            // 更新值
            val = newValue;
        }
    });
}

const sand_table = document.querySelector('#sand_table');
const add_img = document.querySelector('#add_img');
const inputs = document.querySelectorAll('#console input');

add_img.onclick = function () {
    const img = new EcImage();
    img.bindInputs(inputs);
    sand_table.append(img.element);
};

const mouseHandler = (function () {
    let mode = 'drag';
    let target, ecObj, offsetX, offsetY, dragWidth, dragHeight, dragX, dragY;
    const max_x = sand_table.offsetWidth,
        max_y = sand_table.offsetHeight;

    const dragger = document.createElement('div');
    dragger.style.width = '10px';
    dragger.style.height = '10px';
    dragger.style.border = '2px solid #000';
    dragger.style.position = 'absolute';
    dragger.style.transform = 'translate(-100%, -100%)';
    dragger.style.zIndex = '99';
    dragger.style.cursor = 'pointer';
    dragger.style.left = '-100px';
    sand_table.append(dragger);

    function mouseHandler(event) {
        if (event.target == sand_table && !target)
            return false;
        if (event.type == 'animation') {
            ecObj.element.className = event.name;
        }
        switch (event.type) {
            case 'mousedown':
                if (event.target == dragger) {
                    mode = 'resize';
                    dragX = event.pageX;
                    dragY = event.pageY;
                    dragWidth = ecObj.attrs.width;
                    dragHeight = ecObj.attrs.height;
                } else {
                    mode = 'drag';
                    target = event.target;
                    ecObj = target.ecObj;
                    offsetX = event.pageX - ecObj.attrs.left;
                    offsetY = event.pageY - ecObj.attrs.top;
                    ecObj.bindInputs(inputs);
                    // 设置拖拽点
                    dragger.style.left = ecObj.attrs.left + ecObj.attrs.width + 'px';
                    dragger.style.top = ecObj.attrs.top + ecObj.attrs.height + 'px';
                }
                break;
            case 'mousemove':
                if (mode == 'resize') {
                    let width = dragWidth + event.pageX - dragX;
                    let height = dragHeight + event.pageY - dragY;
                    if (width < max_x - ecObj.attrs.left)
                        ecObj.attrs.width = width;
                    if (height < max_y - ecObj.attrs.top)
                        ecObj.attrs.height = height;
                    dragger.style.left = ecObj.attrs.left + ecObj.attrs.width + 'px';
                    dragger.style.top = ecObj.attrs.top + ecObj.attrs.height + 'px';
                } else if (mode == 'drag') {
                    if (target) {
                        let left = event.pageX - offsetX;
                        let top = event.pageY - offsetY;
                        if (left > max_x - target.offsetWidth)
                            left = max_x - target.offsetWidth;
                        else if (left < 0)
                            left = 0;
                        if (top > max_y - target.offsetHeight)
                            top = max_y - target.offsetHeight;
                        else if (top < 0)
                            top = 0;
                        ecObj.attrs.left = left
                        ecObj.attrs.top = top;
                        // 设置拖拽点
                        dragger.style.left = ecObj.attrs.left + ecObj.attrs.width + 'px';
                        dragger.style.top = ecObj.attrs.top + ecObj.attrs.height + 'px';
                    }
                }
                break;
            // case 'mouseout':
            case 'mouseup':
                mode = '';
                //target = null;
                //ecObj = null;
                break;
        }
        return false;
    }

    return mouseHandler;
})();

sand_table.onmousedown =
    sand_table.onmousemove =
    sand_table.onmouseup =
    sand_table.onmouseout = mouseHandler;