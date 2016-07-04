# realClock.js - 获取实时时间控件

### 特性

- 单体控件，弃置了OO（new XXX）的使用方式，杜绝旧控件的以下问题：

    + 重复使用造成性能损耗乃至内存泄露

    + 诡异的多处时间不同步

    + 不必要的客户端和服务器压力

- API支持需求定制，demo集成了全球时间、倒计时等常用业务

- 业务调用返回一个```时间task```，用于暂停，销毁等后续操作

------------

### 资源引用

``` html
<script src="src/realClock.js"></script>
```

### 方法

- getStatus() : 获取控件状态

- getTimesamp() : 获取当前时间戳

- bindView(conf[Object]) : 绑定视图更新，返回对应的task对象

``` javascript
// bindView conf格式示例
{
    node : document.getElementById('time_app'),  // 注入的视图节点
    template : '现在是：#year#年#month2#月#date2#日 #hour2#点#minute2#分#second2#秒'  // 文字模板，用"#"成对引用时间数据，可选的时间数据有"year, month, date, hour, minute, second, month2（固定占双字符，如为个位数将自动在前面补0，下同）, date2, hour2, minute2, second2",
    offset : 0  // 可选，与北京时间的偏移量，以ms为单位
}
```

- onSecChanged(conf[Object]) : 秒变hook，返回对应的task对象，一般用于复杂需求

``` javascript
// onSecChanged conf格式示例
{
    listener : function (realTimesamp) {
        // body
    },   // 秒变hook函数，接受当前时间戳为参数
    offset : 0  // 可选，与北京时间的偏移量，以ms为单位
}
```

- offTask(task[Object]) : 解除特定的某个时间task

`task必须为特定的task对象引用，传入匿名对象没有任何意义，下同`

- pause(task[Object]) : 暂停特定的某个时间task

- continue(task[Object]) : （暂停后）继续特定的某个时间task

------------

### 示例

[demo](../index.html)

##### 示例1：北京时间

html:
``` html
<span id="time_w0"></span>
```

js:
``` javascript
// 绑定视图更新
// 该行为返回一个“时间task”
// 尽可能创建一个指向当前时间task的引用，方便后续管理
var app0 = realClock.bindView({
    node : document.getElementById('time_w0'),
    template : '#year#年#month2#月#date2#日 #hour2#点#minute2#分#second2#秒'
});

// 暂停
// realClock.pause(app0);

// 暂停后继续
// realClock.pause(app0);

// 不再需要该task时，手动移除是个好习惯
// realClock.offTask(app0);
```

##### 示例2：复杂需求定制 - 倒计时

html:
``` html
距离2020年3月29日18点30分还有<span id="time_w6"></span>
```

js:
``` javascript
// 设定时间task
var pointTask = {
    listener : function (realTimesamp) {
        var SECOND = 1000,
            MINUTE = 60 * SECOND,
            HOUR = MINUTE * 60,
            DAY = 24 * HOUR,
            dateOffset = 1585477800000 - realTimesamp,
            day, hour, minute, second;
        if(dateOffset < 0) {
            day = hour = minute = second = '0';
        } else {
            day = parseInt(dateOffset / DAY, 10);
            hour = parseInt((dateOffset % DAY) / HOUR, 10);
            minute = parseInt((dateOffset % HOUR) / MINUTE, 10);
            second = parseInt((dateOffset % MINUTE) / SECOND, 10);
        }
        document.getElementById('time_w6').innerHTML = day + '天' + hour + '小时' + minute + '分钟' + second + '秒';
    }
};
// 启动倒计时
var app6 = realClock.onSecChanged(pointTask);
```

------------