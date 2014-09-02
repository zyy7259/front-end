(function() {
    var page = {
        init: function() {
            this.initData();
            this.initNode();
            this.initEvent();
        },
        initData: function() {
            this.defaultBlogTitle = '日志标题';
            this.defaultBlogCnt = '这里可以写日志哦~';
        },
        initNode: function() {
            this.blogTab = $.get('blogTab');
            this.blogTabCnt = $.get('blogTabCnt');
            this.tagTab = $.get('tagTab');
            this.tagTabCnt = $.get('tagTabCnt');

            this.blogTitle = $.get('blogTitle');
            this.blogCnt = $.get('blogCnt');
            this.submitBlogBtn = $.get('submitBlog');
            this.resetBlogBtn = $.get('resetBlog');
            this.blogForm = $.get('blogForm');

            this.blogList = $.get('blogList');
            this.blogItmTmp = $.get('blogItmTmp');

            this.checkAll = $.get('checkAll');
            this.deleteAll = $.get('deleteAll');
        },
        initEvent: function() {
            $.on(this.blogTab, 'click', this.switchToBlog.bind(this));
            $.on(this.tagTab, 'click', this.switchToTag.bind(this));

            $.on(this.blogTitle, 'focus', this.focusBlogTitle.bind(this));
            $.on(this.blogTitle, 'blur', this.blurBlogTitle.bind(this));
            $.on(this.blogCnt, 'focus', this.focusBlogCnt.bind(this));
            $.on(this.blogCnt, 'blur', this.blurBlogCnt.bind(this));
            $.on(this.submitBlogBtn, 'click', this.submitBlog.bind(this));
            $.on(this.resetBlogBtn, 'click', this.resetBlog.bind(this));

            $.on(this.checkAll, 'click', this.checkAllBlog.bind(this));
            $.on(this.deleteAll, 'click', this.deleteAllBlog.bind(this));
        },
        switchToBlog: function(event) {
            this.blogTab.parentNode.className = 'z-crt';
            this.tagTab.parentNode.className = '';
            this.blogTabCnt.style.display = '';
            this.tagTabCnt.style.display = 'none';
        },
        switchToTag: function(event) {
            this.blogTab.parentNode.className = '';
            this.tagTab.parentNode.className = 'z-crt';
            this.blogTabCnt.style.display = 'none';
            this.tagTabCnt.style.display = '';
        },

        focusBlogTitle: function() {
            if (this.blogTitle.value === this.defaultBlogTitle) {
                this.blogTitle.value = '';
            }
        },
        blurBlogTitle: function() {
            if (this.blogTitle.value === '') {
                this.blogTitle.value = this.defaultBlogTitle;
            }
        },
        focusBlogCnt: function() {
            if (this.blogCnt.value === this.defaultBlogCnt) {
                this.blogCnt.value = '';
            }
        },
        blurBlogCnt: function() {
            if (this.blogCnt.value === '') {
                this.blogCnt.value = this.defaultBlogCnt;
            }
        },
        submitBlog: function() {
            var blogTitle = this.blogTitle.value;
            var blogCnt = this.blogCnt.value;
            if (!blogTitle || blogTitle === this.defaultBlogTitle) {
                alert('请填写日志标题');
                return;
            }
            if (!blogCnt || blogCnt === this.defaultBlogCnt) {
                alert('请填写日志内容');
                return;
            }
            var blog = {
                title: blogTitle,
                cnt: blogCnt
            };
            // TODO rest to post the blog
            this.resetBlog();
            this.insertBlog(blog);
        },
        resetBlog: function() {
            this.blogTitle.value = '日志标题';
            this.blogCnt.value = '这里可以写日志哦~';
        },

        insertBlog: function(blog) {
            var blogItm = this.blogItmTmp.cloneNode(true);
            console.log(blogItm);
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