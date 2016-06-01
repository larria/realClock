var realClock = function() {
    if (window.realClock) {
        return realClock;
    }
    var verifyUrl = (location.protocol.indexOf('http') > -1 ? location.protocol : 'http:') + '//hq.sinajs.cn/?rn=$random&list=sys_time',
        _verified = false,
        _started = false,
        _bindTask = [],
        _interval = 1000,
        _maxOffset = 5 * 1000,
        _offset,
        _loopObj,
        localTime;

    function _start() {
        localTime = new Date();
        _requestReal();
        _loop();
        _loopObj = setInterval(_loop, _interval);
        _started = true;
    }

    function _loop() {
        for (var i = 0; i < _bindTask.length; i++) {
            _bindTask[i].isActive && _bindTask[i].listener(_bindTask[i].offset ? localTime.getTime() + _bindTask[i].offset : localTime.getTime());
        }
        if (typeof _offset === 'number' && _offset - (localTime - (new Date())) > _maxOffset) {
            _verified = false;
            _requestReal();
        }
        localTime = new Date(localTime.getTime() + _interval);
    }

    function _requestReal() {
        _getScript(verifyUrl.replace('$random', Math.random()), function() {
            if (window.hq_str_sys_time) {
                localTime = new Date(hq_str_sys_time * 1000);
                _offset = localTime - (new Date());
                _loop();
                _loopObj && clearInterval(_loopObj);
                _loopObj = setInterval(_loop, _interval);
                _verified = true;
            }
        });
    }

    function _format(timestamp) {
        var tempDate = new Date(timestamp),
            year = tempDate.getFullYear(),
            month = tempDate.getMonth() + 1,
            date = tempDate.getDate(),
            hour = tempDate.getHours(),
            minute = tempDate.getMinutes(),
            second = tempDate.getSeconds();
        return {
            year: year,
            month: month,
            date: date,
            hour: hour,
            minute: minute,
            second: second,
            month2: month > 9 ? month.toString() : '0' + month,
            date2: date > 9 ? date.toString() : '0' + date,
            hour2: hour > 9 ? hour.toString() : '0' + hour,
            minute2: minute > 9 ? minute.toString() : '0' + minute,
            second2: second > 9 ? second.toString() : '0' + second
        };
    }

    function _getScript(url, dispose) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.defer = true;
        script.TimeOutObj = setTimeout(function() {
            script.parentNode.removeChild(script);
        }, 1000);
        script[script.onreadystatechange === null ? 'onreadystatechange' : 'onload'] = function() {
            if (this.onreadystatechange) {
                if (this.readyState !== 'loaded' && this.readyState !== 'complete') {
                    return;
                }
            }
            if (dispose) {
                setTimeout(dispose, 17);
            }
            this[this.onreadystatechange ? 'onreadystatechange' : 'onload'] = null;
            clearTimeout(script.TimeOutObj);
            setTimeout(function() {
                script.parentNode.removeChild(script);
            }, 1000);
        };
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    return {
        getStatus: function() {
            return {
                started: _started,
                verified: _verified,
                taskLen: _bindTask.length
            };
        },
        getTimesamp: function() {
            return localTime;
        },
        bindView: function(conf) {
            var task = {
                isActive: true,
                listener: function(realTimesamp) {
                    var realObj = _format(realTimesamp),
                        formatStr = conf.template
                        .replace(/<script[^>]*?>[^<]*<\/.*?script.*?>/ig, '')
                        .replace(/#year#/ig, realObj.year)
                        .replace(/#month2#/ig, realObj.month2)
                        .replace(/#month#/ig, realObj.month)
                        .replace(/#date2#/ig, realObj.date2)
                        .replace(/#date#/ig, realObj.date)
                        .replace(/#hour2#/ig, realObj.hour2)
                        .replace(/#hour#/ig, realObj.hour)
                        .replace(/#minute2#/ig, realObj.minute2)
                        .replace(/#minute#/ig, realObj.minute2)
                        .replace(/#second2#/ig, realObj.second2)
                        .replace(/#second#/ig, realObj.second);
                    conf.node.innerHTML = formatStr;
                },
                offset: conf.offset
            };
            _bindTask.push(task);
            !_started && _start();
            return task;
        },
        onSecChanged: function(conf) {
            var task = {
                isActive: true,
                listener: conf.listener,
                offset: conf.offset
            };
            _bindTask.push(task);
            !_started && _start();
            return task;
        },
        offTask: function(task) {
            var taskLen = _bindTask.length;
            for (var i = 0; i < taskLen; i++) {
                if (_bindTask[i] === task) {
                    _bindTask.splice(i, 1);
                }
            }
        },
        pause: function(task) {
            task.isActive && (task.isActive = false);
        },
        continue: function(task) {
            !task.isActive && (task.isActive = true);
        }
    };
}();
