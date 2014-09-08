(function() {
    var page = {
        /**
         * 初始化
         */
        init: function() {
            this.initData();
            this.initNode();
            this.initEvent();
            this.pullBlogList();
            this.pullFriendBlogList();
        },
        /**
         * 初始化数据
         */
        initData: function() {
            // 默认的日志标题和内容
            this.defaultBlogTitle = '日志标题';
            this.defaultBlogContent = '这里可以写日志哦~';
            // 滚动动画相关变量
            this.rollTimer = null;
            this.rollInterval = 2000;
            // 动画相关变量
            this.animationTime = 900;
            this.friendBlogHeight = 51;
            this.animationFrameNum = 24;
            this.animationInterval = this.animationTime * 1.0 / this.animationFrameNum;
            this.animationDelta = this.friendBlogHeight * 1.0 / this.animationFrameNum;
            this.rollInterval += this.animationTime;
        },
        /**
         * 初始化节点
         */
        initNode: function() {
            // 标签页相关节点节点
            this.$blogTab = $.get('blogTab');
            this.$blogTabCnt = $.get('blogTabCnt');
            this.$tagTab = $.get('tagTab');
            this.$tagTabCnt = $.get('tagTabCnt');

            // 日志编辑表格相关节点
            this.$blogId = $.get('blogId');
            this.$blogTitle = $.get('blogTitle');
            this.$blogContent = $.get('blogContent');
            this.$submitBlog = $.get('submitBlog');
            this.$resetBlog = $.get('resetBlog');
            this.$blogForm = $.get('blogForm');

            // 日志列表相关节点
            this.$blogListWrap = $.get('blogListWrap');
            this.$blogItmTmp = $.get('blogItmTmp');
            this.$blogList = $.get('blogList');
            this.$topBlogList = $.get('topBlogList');

            // 批量操作相关节点
            this.$checkAll = $.get('checkAll');
            this.$deleteAll = $.get('deleteAll');

            // 好友日志相关节点
            this.$friendBlogItmTmp = $.get('friendBlogItmTmp');
            this.$friendBlogList = $.get('friendBlogList');
        },
        /**
         * 初始化事件
         */
        initEvent: function() {
            // 标签页切换相关事件
            $.on(this.$blogTab, 'click', this.switchToBlog.bind(this));
            $.on(this.$tagTab, 'click', this.switchToTag.bind(this));

            // 日志编辑表格相关事件
            $.on(this.$blogTitle, 'focus', this.focusBlogTitle.bind(this));
            $.on(this.$blogTitle, 'blur', this.blurBlogTitle.bind(this));
            $.on(this.$blogContent, 'focus', this.focusBlogCnt.bind(this));
            $.on(this.$blogContent, 'blur', this.blurBlogCnt.bind(this));
            $.on(this.$submitBlog, 'click', this.submitBlog.bind(this));
            $.on(this.$resetBlog, 'click', this.resetBlog.bind(this));

            // 日志列表事件代理
            $.on(document, 'click', this.clickDocument.bind(this));
            $.on(this.$blogListWrap, 'click', this.clickBlogList.bind(this));

            // 批量操作相关事件
            $.on(this.$checkAll, 'click', this.checkAllBlog.bind(this));
            $.on(this.$deleteAll, 'click', this.deleteAllBlog.bind(this));

            // 好友日志动画相关事件
            $.on(this.$friendBlogList, 'mouseenter', this.enterFriendBlogs.bind(this));
            $.on(this.$friendBlogList, 'mouseleave', this.leaveFriendBlogs.bind(this));
        },

        /**
         * 切换到日志tab，隐藏标签tab
         */
        switchToBlog: function(event) {
            this.$blogTab.parentNode.className = 'z-crt';
            this.$tagTab.parentNode.className = '';
            this.$blogTabCnt.style.display = '';
            this.$tagTabCnt.style.display = 'none';
        },
        /**
         * 标签tab，隐藏日志tab
         */
        switchToTag: function(event) {
            this.$blogTab.parentNode.className = '';
            this.$tagTab.parentNode.className = 'z-crt';
            this.$blogTabCnt.style.display = 'none';
            this.$tagTabCnt.style.display = '';
        },

        /**
         * 从服务器拉取日志列表
         */
        pullBlogList: function() {
            $.rest({
                url: 'http://fed.hz.netease.com/api/getblogs',
                method: 'GET',
                onload: this.cbBlogList.bind(this)
            });
        },
        /**
         * 拉取日志列表后的回调函数
         */
        cbBlogList: function(json) {
            var id = +new Date;
            if (!!json) {
                this.blogList = json;

                // 初始化用户信息
                var blog = this.blogList[0];
                this.userId = blog.userId;
                this.userName = blog.userName;
                $usericons = $.querySelectorAll(document, '.j-usericon');
                for (var i = 0, l = $usericons.length; i < l; i++) {
                    $usericons[i].src = 'http://os.blog.163.com/common/ava.s?host=' + this.userName + '&b=0&r=-1';
                }
                this.userNickname = blog.userNickname;
                $nicknames = $.querySelectorAll(document, '.j-nickname');
                for (var i = 0, l = $nicknames.length; i < l; i++) {
                    $nicknames[i].innerHTML = this.userNickname;
                }
                this.blogClassId = blog.classId;

                // 修正数据，服务器数据是不完善的
                for (var i = 0, l = this.blogList.length; i < l; i++) {
                    var blog = this.blogList[i];
                    // 修正modifyTime，如果没有modifyTime，将其置为publishTime
                    if (blog.modifyTime === "0") {
                        blog.modifyTime = blog.publishTime;
                    }
                }
                // 将列表按照modifyTime字段进行倒序排列
                this.blogList.sort(function(a, b) {return +b.modifyTime - +a.modifyTime});
                for (var i = 0, l = this.blogList.length; i < l; i++) {
                    var blog = this.blogList[i];
                    // 修正id，服务器的id是不正确的
                    blog.id = id++;
                    this.blogList[blog.id] = blog;
                    // 按照rank字段添加日志和置顶日志
                    switch (blog.rank) {
                        case "0":
                        this.appendBlog(blog);
                        break;
                        case "5":
                        this.appendTopBlog(blog);
                        break;
                    }
                }
            } else {
                alert('获取日志列表失败，请稍后重试');
            }
        },

        /**
         * 添加置顶日志
         */
        appendTopBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            $.querySelector($blog, '.j-topLi').style.display = 'none';
            this.$topLiBlogList.appendChild($blog);
        },
        /**
         * 添加日志
         */
        appendBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            $.querySelector($blog, '.j-untopLi').style.display = 'none';
            this.$blogList.appendChild($blog);
        },
        /**
         * 插入日志到日志列表的第一项
         */
        insertBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            $.querySelector($blog, '.j-untopLi').style.display = 'none';
            this.$blogList.insertBefore($blog, this.$blogList.firstChild);
        },
        /**
         * 复制日志节点，并初始化公共信息
         */
        cloneBlogItm: function(blog) {
            var $blog = this.$blogItmTmp.cloneNode(true);
            $blog.removeAttribute('id');
            // id
            var $id = $.querySelector($blog, '.j-id');
            $id.value = blog.id;
            // rank
            var $rank = $.querySelector($blog, '.j-rank');
            $rank.value = blog.rank;
            // title
            var $title = $.querySelector($blog, '.j-title');
            $title.innerHTML = blog.title;
            // modify time
            var $date = $.querySelector($blog, '.j-date');
            $date.innerHTML = zjs.datestr(blog.modifyTime);
            // read num
            var $readnum = $.querySelector($blog, '.j-readnum');
            $readnum.innerHTML = blog.accessCount;
            // comment num
            var $cmtnum = $.querySelector($blog, '.j-cmtnum');
            $cmtnum.innerHTML = blog.commentCount;
            // private
            if (blog.allowView == 10000) {
                var $private = $.querySelector($blog, '.j-private');
                $private.style.display = '';
            }
            // show blog
            $blog.style.display = '';
            return $blog;
        },

        /**
         * 拉取好友日志列表
         */
        pullFriendBlogList: function() {
            $.rest({
                url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=289939',
                method: 'GET',
                onload: this.cbFriendBlogList.bind(this)
            });
        },
        /**
         * 拉取好友日志列表回调函数
         */
        cbFriendBlogList: function(json) {
            var id = +new Date;
            if (!!json) {
                this.friendBlogList = json;
                for (var i = 0, l = this.friendBlogList.length; i < l; i++) {
                    var blog = this.friendBlogList[i];
                    // 修正modifyTime，如果没有modifyTime，将其置为publishTime
                    if (blog.modifyTime === "0") {
                        blog.modifyTime = blog.publishTime;
                    }
                }
                this.friendBlogList.sort(function(a, b) {return +b.modifyTime - +a.modifyTime});
                for (var i = 0, l = this.friendBlogList.length; i < l; i++) {
                    var blog = this.friendBlogList[i];
                    // 修正id
                    blog.id = id++;
                    this.friendBlogList[blog.id] = blog;
                    this.appendFriendBlog(blog);
                }
                // 将好友列表用动画展示起来
                if (this.friendBlogList.length > 5) {
                    this.rollFriendBlogs();
                }
            } else {
                alert('获取好友日志列表失败，请稍后重试');
            }
        },
        /**
         * 添加好友日志项
         */
        appendFriendBlog: function(blog) {
            var $blog = this.cloneFriendBlogItm(blog);
            this.$friendBlogList.appendChild($blog);
        },
        /**
         * 复制好友日志节点，并初始化相关信息
         */
        cloneFriendBlogItm: function(blog) {
            $blog = this.$friendBlogItmTmp.cloneNode(true);
            $blog.removeAttribute('id');
            // id
            var $id = $.querySelector($blog, '.j-id');
            $id.value = blog.id;
            // image 
            var $img = $.querySelector($blog, '.j-img');
            $img.src = 'http://os.blog.163.com/common/ava.s?host=' + blog.userName + '&b=0&r=-1';
            // name
            var $name = $.querySelector($blog, '.j-name');
            $name.innerHTML = blog.userNickname;
            // title
            var $title = $.querySelector($blog, '.j-title');
            $title.innerHTML = blog.title;
            // show blog
            $blog.style.display = '';
            return $blog;
        },

        /**
         * 日志编辑表单的标题获取焦点
         */
        focusBlogTitle: function() {
            if (this.$blogTitle.value === this.defaultBlogTitle) {
                this.$blogTitle.value = '';
            }
        },
        /**
         * 日志编辑表单的标题失去焦点
         */
        blurBlogTitle: function() {
            if (this.$blogTitle.value === '') {
                this.$blogTitle.value = this.defaultBlogTitle;
            }
        },
        /**
         * 日志编辑表单的内容获取焦点
         */
        focusBlogCnt: function() {
            if (this.$blogContent.value === this.defaultBlogContent) {
                this.$blogContent.value = '';
            }
        },
        /**
         * 日志编辑表单的内容失去焦点
         */
        blurBlogCnt: function() {
            if (this.$blogContent.value === '') {
                this.$blogContent.value = this.defaultBlogContent;
            }
        },
        /**
         * 提交日志编辑表单
         */
        submitBlog: function() {
            var id = this.$blogId.value || +new Date;
            var blogTitle = this.$blogTitle.value;
            var blogContent = this.$blogContent.value;
            if (!blogTitle || blogTitle === this.defaultBlogTitle) {
                alert('请填写日志标题');
                return;
            }
            if (!blogContent || blogContent === this.defaultBlogContent) {
                alert('请填写日志内容');
                return;
            }
            // 拼装日志数据
            var blog = {
                title: blogTitle,
                blogContent: blogContent,
                modifyTime: +new Date,
                accessCount: 0,
                commentCount: 0,
                allowView: -100,
                classId: this.blogClassId,
                id: id,
                userId: this.userId,
                userName: this.userName,
                userNickname: this.userNickname
            }
            var blogStr = '{' + 
                            '"title":"' + blogTitle + '","blogContent":"' + blogContent + '"}';
            $.ajax({
                url: 'http://fed.hz.netease.com/api/addBlog',
                method: 'POST',
                data: blogStr,
                onload: this.cbSubmitBlog.bind(this, blog)
            });
        },
        /**
         * 提交日志表单的回调函数
         */
        cbSubmitBlog: function(blog, xhr) {
            if (xhr.responseText === '1') {
                // 如果是编辑，则将新编辑的日志放置于列表最上方并更新，否则新加一条日志项
                if (!!this.$currBlog) {
                    // 根据是否是置顶日志，将编辑的日志插入相应的列表最上方
                    var $rank = $.querySelector(this.$currBlog, '.j-rank');
                    if ($rank.value === '5') {
                        this.$topBlogList.insertBefore(this.$currBlog, this.$topBlogList.firstChild);
                    } else {
                        this.$blogList.insertBefore(this.$currBlog, this.$blogList.firstChild);
                    }
                    // 更新编辑的日志数据
                    this.blogList[blog.id] = blog;
                    this.updateModifiedBlog(blog);
                } else {
                    this.blogList.splice(0, 0, blog);
                    this.blogList[blog.id] = blog;
                    this.insertBlog(blog);
                }
                this.resetBlog();
            } else {
                alert('操作失败，请稍后重试');
            }
        },
        /**
         * 更新被修改的日志的信息
         */
        updateModifiedBlog: function(blog) {
            // modify title
            var $title = $.querySelector(this.$currBlog, '.j-title');
            $title.innerHTML = blog.title;
            // modify time
            var $date = $.querySelector(this.$currBlog, '.j-date');
            $date.innerHTML = zjs.datestr(blog.modifyTime);
        },
        /**
         * 重置日志编辑表单
         */
        resetBlog: function() {
            this.$currBlog = null;
            this.$blogId.value = '';
            this.$blogTitle.value = '日志标题';
            this.$blogContent.value = '这里可以写日志哦~';
        },

        /**
         * 点击页面的代理函数
         */
        clickDocument: function() {
            this.hideMoreOprts();
        },
        /**
         * 点击日志列表的代理函数
         */
        clickBlogList: function(event) {
            var element = event.target|| event.srcElement;
            // 找到对应的列表项
            this.$currBlog = element;
            while (!!this.$currBlog && this.$currBlog!==this.$blogListWrap) {
                if (!!this.$currBlog.className && this.$currBlog.className.indexOf('j-blog') !== -1) break;
                if (!this.$currBlog.className || this.$currBlog.className.indexOf('j-blog') === -1) {
                    this.$currBlog = this.$currBlog.parentNode;
                }
            }
            if (!this.$currBlog || this.$currBlog===this.$blogListWrap) return;
            
            // 根据不同的命令采取不同的操作
            var className = element.className;
            if (className.indexOf('j-edit') !== -1) {
                $.stop(event);
                this.editBlog();
                this.hideMoreOprts();
            } else if (className.indexOf('j-more') !== -1) {
                $.stop(event);
                this.showMoreOprts();
            } else if (className.indexOf('j-unmore') !== -1) {
                $.stop(event);
                this.hideMoreOprts();
            } else if (className.indexOf('j-delete') !== -1) {
                $.stop(event);
                this.deleteCurrBlog();
                this.hideMoreOprts();
            } else if (className.indexOf('j-top') !== -1) {
                $.stop(event);
                this.topCurrBlog();
                this.hideMoreOprts();
            } else if (className.indexOf('j-untop') !== -1) {
                $.stop(event);
                this.untopCurrBlog();
                this.hideMoreOprts();
            }
        },
        /**
         * 获取当前被操作日志的id
         */
        idOfCurrBlog: function() {
            return $.querySelector(this.$currBlog, '.j-id').value;
        },
        /**
         * 编辑当前的日志
         */
        editBlog: function() {
            var id = this.idOfCurrBlog();
            var blog = this.blogList[id];
            this.$blogId.value = id;
            this.$blogTitle.value = blog.title;
            this.$blogContent.value = blog.blogContent;
        },
        /**
         * 显示当前日志对应的菜单
         */
        showMoreOprts: function() {
            this.hideMoreOprts();
            var $moreOprts = $.querySelector(this.$currBlog, '.j-moreoprts');
            $moreOprts.style.display = '';
        },
        /**
         * 隐藏当前日志对应的菜单
         */
        hideMoreOprts: function() {
            var $moreOprtses =  $.querySelectorAll(this.$blogListWrap, '.j-moreoprts');
            for (var i = 0, l = $moreOprtses.length; i < l; i++) {
                var $moreOprts = $moreOprtses[i];
                $moreOprts.style.display = 'none';
            }
        },
        /**
         * 删除当前日志
         */
        deleteCurrBlog: function() {
            var id = this.idOfCurrBlog();
            $.ajax({
                url: 'http://fed.hz.netease.com/api/deleteBlogs',
                method: 'POST',
                data: '{"id":"' + id + '"}',
                onload: this.cbDeleteCurrBlog.bind(this)
            });
        },
        /**
         * 删除当前日志的回调函数
         */
        cbDeleteCurrBlog: function(xhr) {
            if (xhr.responseText === '1') {
                this.$currBlog.parentNode.removeChild(this.$currBlog);
            } else {
                alert('删除失败，请稍后重试');
            }
        },
        /**
         * 置顶当前日志
         */
        topCurrBlog: function() {
            var id = this.idOfCurrBlog();
            $.ajax({
                url: 'http://fed.hz.netease.com/api/topBlog',
                method: 'POST',
                data: '{"id":"' + id + '"}',
                onload: this.cbTopCurrBlog.bind(this)
            })
        },
        /**
         * 置顶当前日志的回调函数
         */
        cbTopCurrBlog: function(xhr) {
            if (xhr.responseText === '1') {
                // 更新rank
                var rank = 5;
                var id = this.idOfCurrBlog();
                var blog = this.blogList[id];
                blog.rank = rank;
                var $rank = $.querySelector(this.$currBlog, '.j-rank');
                $rank.value = rank;
                // 更新modifyTime
                blog.modifyTime = +new Date;
                var $date = $.querySelector(this.$currBlog, '.j-date');
                $date.innerHTML = zjs.datestr(blog.modifyTime);
                // 更新菜单
                $.querySelector(this.$currBlog, '.j-topLi').style.display = 'none';
                $.querySelector(this.$currBlog, '.j-untopLi').style.display = '';
                // 更新列表
                this.$topBlogList.insertBefore(this.$currBlog, this.$topBlogList.firstChild);
            } else {
                alert('置顶失败，请稍后重试');
            }
        },
        /**
         * 取消置顶当前日志
         */
        untopCurrBlog: function() {
            var id = this.idOfCurrBlog();
            $.ajax({
                url: 'http://fed.hz.netease.com/api/untopBlog',
                method: 'POST',
                data: '{"id":"' + id + '"}',
                onload: this.cbUntopCurrBlog.bind(this)
            })
        },
        /**
         * 取消置顶当前日志的回调函数
         */
        cbUntopCurrBlog: function(xhr) {
            if (xhr.responseText === '1') {
                // 更新rank
                var rank = 0;
                var id = this.idOfCurrBlog();
                var blog = this.blogList[id];
                blog.rank = rank;
                var $rank = $.querySelector(this.$currBlog, '.j-rank');
                $rank.value = rank;
                // 更新modifyTime
                blog.modifyTime = +new Date;
                var $date = $.querySelector(this.$currBlog, '.j-date');
                $date.innerHTML = zjs.datestr(blog.modifyTime);
                // 更新菜单
                $.querySelector(this.$currBlog, '.j-topLi').style.display = '';
                $.querySelector(this.$currBlog, '.j-untopLi').style.display = 'none';
                // 更新列表
                this.$blogList.insertBefore(this.$currBlog, this.$blogList.firstChild);
            } else {
                alert('取消置顶失败，请稍后重试');
            }
        },

        /**
         * 勾选所有日志
         */
        checkAllBlog: function() {
            var $checkboxes = $.querySelectorAll(this.$blogList, '.j-check');
            var checked = this.$checkAll.checked;
            for (var i = 0, l = $checkboxes.length; i < l; i++) {
                var $checkbox = $checkboxes[i];
                $checkbox.checked = checked;
            }
        },
        /**
         * 删除所有日志
         */
        deleteAllBlog: function() {
            this.$checkAll.checked = false;
            var $checkboxes = $.querySelectorAll(this.$blogList, '.j-check');
            var $blogsToDelete = [];
            var ids = [];
            for (var i = 0, l = $checkboxes.length; i < l; i++) {
                var $checkbox = $checkboxes[i];
                if ($checkbox.checked) {
                    var $blog = $checkbox.parentNode.parentNode;
                    $blogsToDelete.push($blog);
                    var id = $.querySelector($blog, '.j-id').value;
                    ids.push(id);
                }
            }
            if (!ids.length) {
                alert('请选择要删除的日志');
                return;
            }
            var idsstr = '[' + ids[0];
            for (var i = 1, l = ids.length; i < l; i++) {
                idsstr += ', ' + ids[i];
            }
            idsstr += ']';
            $.ajax({
                url: 'http://fed.hz.netease.com/api/deleteBlogs',
                method: 'POST',
                data: idsstr,
                onload: this.cbDeleteAllBlog.bind(this, $blogsToDelete)
            });
        },
        /**
         * 删除所有日志的回调函数
         */
        cbDeleteAllBlog: function($blogsToDelete, xhr) {
            if (xhr.responseText === '1') {
                for (var i = 0, l = $blogsToDelete.length; i < l; i++) {
                    var $blog = $blogsToDelete[i];
                    $blog.parentNode.removeChild($blog);
                }
            } else {
                alert('删除失败，请稍后重试');
            }
        },

        /**
         * 鼠标移动到好友日志列表，停止滚动
         */
        enterFriendBlogs: function() {
            clearTimeout(this.rollTimer);
            this.rollTimer = null;
        },
        /**
         * 鼠标移出好友日志列表，开始滚动
         */
        leaveFriendBlogs: function() {
            if (this.rollTimer == null) {
                this.rollFriendBlogs();
            }
        },
        /**
         * 滚动好友日志列表
         */
        rollFriendBlogs: function() {
            this.rollTimer = setTimeout(function(){
                this.doRollFriendBlogs();
                this.rollFriendBlogs();
            }.bind(this), this.rollInterval);
        },
        /**
         * 实际滚动处理函数
         */
        doRollFriendBlogs: function() {
            var marginTop = parseFloat(this.$friendBlogList.style.marginTop) || 0;
            if (-marginTop >= this.friendBlogHeight) {
                this.$friendBlogList.appendChild(this.$friendBlogList.firstChild);
                this.$friendBlogList.style.marginTop = '0';
                return;
            }
            marginTop -= this.animationDelta;
            this.$friendBlogList.style.marginTop = marginTop + 'px';
            setTimeout(this.doRollFriendBlogs.bind(this), this.animationInterval);
        }
    };
    window.onload = function() {
        page.init();
    };
})();