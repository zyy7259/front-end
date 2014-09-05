(function() {
    var page = {
        init: function() {
            this.initData();
            this.initNode();
            this.initEvent();
            this.pullBlogList();
            this.pullFriendBlogList();
        },
        initData: function() {
            this.userId = 289939;
            this.userName = 'force2002';
            this.userNickname = '悟空空';
            this.blogClassId = 'fks_083069087087080069082083074065092095088064093';
            this.defaultBlogTitle = '日志标题';
            this.defaultBlogContent = '这里可以写日志哦~';
        },
        initNode: function() {
            this.$blogTab = $.get('blogTab');
            this.$blogTabCnt = $.get('blogTabCnt');
            this.$tagTab = $.get('tagTab');
            this.$tagTabCnt = $.get('tagTabCnt');

            this.$blogId = $.get('blogId');
            this.$blogTitle = $.get('blogTitle');
            this.$blogContent = $.get('blogContent');
            this.$submitBlog = $.get('submitBlog');
            this.$resetBlog = $.get('resetBlog');
            this.$blogForm = $.get('blogForm');

            this.$blogListWrap = $.get('blogListWrap');
            this.$blogItmTmp = $.get('blogItmTmp');
            this.$blogList = $.get('blogList');
            this.$topBlogList = $.get('topBlogList');

            this.$checkAll = $.get('checkAll');
            this.$deleteAll = $.get('deleteAll');

            this.$friendBlogItmTmp = $.get('friendBlogItmTmp');
            this.$friendBlogList = $.get('friendBlogList');
        },
        initEvent: function() {
            $.on(this.$blogTab, 'click', this.switchToBlog.bind(this));
            $.on(this.$tagTab, 'click', this.switchToTag.bind(this));

            $.on(this.$blogTitle, 'focus', this.focusBlogTitle.bind(this));
            $.on(this.$blogTitle, 'blur', this.blurBlogTitle.bind(this));
            $.on(this.$blogContent, 'focus', this.focusBlogCnt.bind(this));
            $.on(this.$blogContent, 'blur', this.blurBlogCnt.bind(this));
            $.on(this.$submitBlog, 'click', this.submitBlog.bind(this));
            $.on(this.$resetBlog, 'click', this.resetBlog.bind(this));

            $.on(document, 'click', this.clickDocument.bind(this));
            $.on(this.$blogList.parentNode, 'click', this.clickBlogList.bind(this));

            $.on(this.$checkAll, 'click', this.checkAllBlog.bind(this));
            $.on(this.$deleteAll, 'click', this.deleteAllBlog.bind(this));
        },

        switchToBlog: function(event) {
            this.$blogTab.parentNode.className = 'z-crt';
            this.$tagTab.parentNode.className = '';
            this.$blogTabCnt.style.display = '';
            this.$tagTabCnt.style.display = 'none';
        },
        switchToTag: function(event) {
            this.$blogTab.parentNode.className = '';
            this.$tagTab.parentNode.className = 'z-crt';
            this.$blogTabCnt.style.display = 'none';
            this.$tagTabCnt.style.display = '';
        },

        pullBlogList: function() {
            $.rest({
                url: 'http://fed.hz.netease.com/api/getblogs',
                method: 'GET',
                onload: this.cbBlogList.bind(this)
            });
        },
        cbBlogList: function(json) {
            var id = +new Date;
            if (!!json) {
                this.blogList = json;
                for (var i = 0, l = this.blogList.length; i < l; i++) {
                    var blog = this.blogList[i];
                    // 修正modifyTime，如果没有modifyTime，将其置为publishTime
                    if (blog.modifyTime === "0") {
                        blog.modifyTime = blog.publishTime;
                    }
                }
                this.blogList.sort(function(a, b) {return +b.modifyTime - +a.modifyTime});
                for (var i = 0, l = this.blogList.length; i < l; i++) {
                    var blog = this.blogList[i];
                    // 修正id
                    blog.id = id++;
                    this.blogList[blog.id] = blog;
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

        appendTopBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            $.querySelector($blog, '.j-topLi').style.display = 'none';
            this.$topLiBlogList.appendChild($blog);
        },
        appendBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            $.querySelector($blog, '.j-untopLi').style.display = 'none';
            this.$blogList.appendChild($blog);
        },
        insertBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            $.querySelector($blog, '.j-untopLi').style.display = 'none';
            this.$blogList.insertBefore($blog, this.$blogList.firstChild);
        },
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

        pullFriendBlogList: function() {
            $.rest({
                url: 'http://fed.hz.netease.com/api/getFriendsLatestBlogs?userid=289939',
                method: 'GET',
                onload: this.cbFriendBlogList.bind(this)
            });
        },
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
            } else {
                alert('获取好友日志列表失败，请稍后重试');
            }
        },
        appendFriendBlog: function(blog) {
            var $blog = this.cloneFriendBlogItm(blog);
            this.$friendBlogList.appendChild($blog);
        },
        cloneFriendBlogItm: function(blog) {
            $blog = this.$friendBlogItmTmp.cloneNode(true);
            $blog.removeAttribute('id');
            // id
            var $id = $.querySelector($blog, '.j-id');
            $id.value = blog.id;
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

        focusBlogTitle: function() {
            if (this.$blogTitle.value === this.defaultBlogTitle) {
                this.$blogTitle.value = '';
            }
        },
        blurBlogTitle: function() {
            if (this.$blogTitle.value === '') {
                this.$blogTitle.value = this.defaultBlogTitle;
            }
        },
        focusBlogCnt: function() {
            if (this.$blogContent.value === this.defaultBlogContent) {
                this.$blogContent.value = '';
            }
        },
        blurBlogCnt: function() {
            if (this.$blogContent.value === '') {
                this.$blogContent.value = this.defaultBlogContent;
            }
        },
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
            // rest to post the blog
            var blogStr = '{' + 
                            '"title":"' + blogTitle + '","blogContent":"' + blogContent + '"}';
            $.ajax({
                url: 'http://fed.hz.netease.com/api/addBlog',
                method: 'POST',
                data: blogStr,
                onload: this.cbSubmitBlog.bind(this, blog)
            });
        },
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
        updateModifiedBlog: function(blog) {
            // modify title
            var $title = $.querySelector(this.$currBlog, '.j-title');
            $title.innerHTML = blog.title;
            // modify time
            var $date = $.querySelector(this.$currBlog, '.j-date');
            $date.innerHTML = zjs.datestr(blog.modifyTime);
        },
        resetBlog: function() {
            this.$currBlog = null;
            this.$blogId.value = '';
            this.$blogTitle.value = '日志标题';
            this.$blogContent.value = '这里可以写日志哦~';
        },

        clickDocument: function() {
            this.hideMoreOprts();
        },
        clickBlogList: function(event) {
            var element = event.target|| event.srcElement;
            // 找到列表元素
            this.$currBlog = element;
            while (!!this.$currBlog && this.$currBlog!==this.$blogListWrap) {
                if (!!this.$currBlog.className && this.$currBlog.className.indexOf('j-blog') !== -1) break;
                if (!this.$currBlog.className || this.$currBlog.className.indexOf('j-blog') === -1) {
                    this.$currBlog = this.$currBlog.parentNode;
                }
            }
            if (!this.$currBlog || this.$currBlog===this.$blogListWrap) return;
            
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
        idOfCurrBlog: function() {
            return $.querySelector(this.$currBlog, '.j-id').value;
        },
        editBlog: function() {
            var id = this.idOfCurrBlog();
            var blog = this.blogList[id];
            this.$blogId.value = id;
            this.$blogTitle.value = blog.title;
            this.$blogContent.value = blog.blogContent;
        },
        showMoreOprts: function() {
            this.hideMoreOprts();
            var $moreOprts = $.querySelector(this.$currBlog, '.j-moreoprts');
            $moreOprts.style.display = '';
        },
        hideMoreOprts: function() {
            var $moreOprtses =  $.querySelectorAll(this.$blogList, '.j-moreoprts');
            for (var i = 0, l = $moreOprtses.length; i < l; i++) {
                var $moreOprts = $moreOprtses[i];
                $moreOprts.style.display = 'none';
            }
        },
        deleteCurrBlog: function() {
            var id = this.idOfCurrBlog();
            $.ajax({
                url: 'http://fed.hz.netease.com/api/deleteBlogs',
                method: 'POST',
                data: '{"id":"' + id + '"}',
                onload: this.cbDeleteCurrBlog.bind(this)
            });
        },
        cbDeleteCurrBlog: function(xhr) {
            if (xhr.responseText === '1') {
                this.$currBlog.parentNode.removeChild(this.$currBlog);
            } else {
                alert('删除失败，请稍后重试');
            }
        },
        topCurrBlog: function() {
            var id = this.idOfCurrBlog();
            $.ajax({
                url: 'http://fed.hz.netease.com/api/topBlog',
                method: 'POST',
                data: '{"id":"' + id + '"}',
                onload: this.cbTopCurrBlog.bind(this)
            })
        },
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
        untopCurrBlog: function() {
            var id = this.idOfCurrBlog();
            $.ajax({
                url: 'http://fed.hz.netease.com/api/untopBlog',
                method: 'POST',
                data: '{"id":"' + id + '"}',
                onload: this.cbUntopCurrBlog.bind(this)
            })
        },
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

        checkAllBlog: function() {
            var $checkboxes = $.querySelectorAll(this.$blogList, '.j-check');
            var checked = this.$checkAll.checked;
            for (var i = 0, l = $checkboxes.length; i < l; i++) {
                var $checkbox = $checkboxes[i];
                $checkbox.checked = checked;
            }
        },
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
        cbDeleteAllBlog: function($blogsToDelete, xhr) {
            if (xhr.responseText === '1') {
                for (var i = 0, l = $blogsToDelete.length; i < l; i++) {
                    var $blog = $blogsToDelete[i];
                    $blog.parentNode.removeChild($blog);
                }
            } else {
                alert('删除失败，请稍后重试');
            }
        }
    };
    window.onload = function() {
        page.init();
    };
})();