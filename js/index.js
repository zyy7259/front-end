(function() {
    var page = {
        init: function() {
            this.initData();
            this.initNode();
            this.initEvent();
            this.pullBlogList();
        },
        initData: function() {
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

            this.$blogItmTmp = $.get('blogItmTmp');
            this.$blogList = $.get('blogList');
            this.$topBlogList = $.get('topBlogList');

            this.$checkAll = $.get('checkAll');
            this.$deleteAll = $.get('deleteAll');
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
                this.blogList.sort(function(a, b) {return +b.modifyTime - +a.modifyTime});
                for (var i = 0, l = this.blogList.length; i < l; i++) {
                    var blog = this.blogList[i];
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
            }
            console.log(this.blogList);
        },

        appendTopBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            this.$topBlogList.appendChild($blog);
        },
        appendBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            this.$blogList.appendChild($blog);
        },
        insertBlog: function(blog) {
            var $blog = this.cloneBlogItm(blog);
            this.$blogList.insertBefore($blog, this.$blogList.firstChild);
        },
        cloneBlogItm: function(blog) {
            var $blog = this.$blogItmTmp.cloneNode(true);
            // id
            var $id = $.querySelector($blog, '.j-id');
            $id.value = blog.id;
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
            // 如果是编辑，则将新编辑的日志放置于列表最上方
            if (!!this.$currBlog) {
                this.$blogList.insertBefore(this.$currBlog, this.$blogList.firstChild);
            }

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
                classId: 'fks_083069087087080069082083074065092095088064093',
                id: id,
                userId: "289939",
                userName: "force2002",
                userNickname: "悟空空"
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
                // 如果是编辑，则更新，否则新加
                if (!!this.$currBlog) {
                    this.blogList[blog.id] = blog;
                    this.updateModifiedBlog(blog);
                } else {
                    this.blogList.splice(0, 0, blog);
                    this.blogList[blog.id] = blog;
                    this.insertBlog(blog);
                }
                this.resetBlog();
            }
        },
        resetBlog: function() {
            this.$currBlog = null;
            this.$blogId.value = '';
            this.$blogTitle.value = '日志标题';
            this.$blogContent.value = '这里可以写日志哦~';
        },
        updateModifiedBlog: function(blog) {
            // title
            var $title = $.querySelector(this.$currBlog, '.j-title');
            $title.innerHTML = blog.title;
            // modify time
            var $date = $.querySelector(this.$currBlog, '.j-date');
            $date.innerHTML = zjs.datestr(blog.modifyTime);
        },

        clickBlogList: function(event) {
            var element = event.target|| event.srcElement;
            this.$currBlog = element.parentNode.parentNode.parentNode;
            
            var className = element.className;
            if (className.indexOf('j-edit') !== -1) {
                $.stop(event);
                this.fillBlogForm();
            } else if (className.indexOf('j-more') !== -1) {
                $.stop(event);
                this.showMoreOprts();
            }
        },
        fillBlogForm: function() {
            var id = $.querySelector(this.$currBlog, '.j-id').value;
            var blog = this.blogList[id];
            this.$blogId.value = id;
            this.$blogTitle.value = blog.title;
            this.$blogContent.value = blog.blogContent;
        },
        showMoreOprts: function() {
            var $moreOprts = $.querySelector(this.$currBlog, '.j-moreoprts');
            $moreOprts.style.display = '';
        },

        checkAllBlog: function() {
            console.log('checkAll');
        },
        deleteAllBlog: function() {
            console.log('deleteAll');
        }
    };
    window.onload = function() {
        page.init();
    };
})();