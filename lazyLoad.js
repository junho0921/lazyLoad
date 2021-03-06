define(function(require, exports, module){

	var LazyLoad = module.exports = function(configs){

		this.configs = $.extend({}, this._defaultConfigs, configs);
		
		this.initialize();

		return this;
	};

	LazyLoad.prototype = {
		_staticConfigs:{
			eventType: 'scroll.LazyLoad',
			data_attribute: "original",
			lazyImgClass: 'lazy'
		},
		
		_defaultConfigs: {
			container: window,
			threshold: 0.5,
			triggerFreq: 4
		},

		_scrollCount: 0,

		_scrollTopMemory: 0,

		initialize: function(){
			this._$container = $(this.configs.container);

			this._$container.on(this._staticConfigs.eventType, $.proxy(this._onScroll, this));

			this._$container.trigger(this._staticConfigs.eventType);
		},

		_getLazyLoadImgs: function(){
			return this._$container.find('img.' + this._staticConfigs.lazyImgClass);
		},

		/*
		* 滚动容器触发的检测加载图片方法
		* */
		_onScroll: function(){
			if(this._scrollCount++ % this._defaultConfigs.triggerFreq != 0){
				return;
			}

			var scrollTop = this._$container.scrollTop();

			if(scrollTop - this._scrollTopMemory > 30 || scrollTop == 0){
				this._scrollTopMemory = scrollTop;

				var $imgs = this._getLazyLoadImgs(),
					len = $imgs.length;

				if(!len)return;

				for(var i = 0; i < len; i++){

					var img = $imgs[i];

					if(this._verticalVisible(img, scrollTop)){
						this._loadImg(img);
					} else {
						break; // 当遍历到不在可视范围内的, 便停止遍历
					}
				}
			}
		},

		/*
		* 加载图片方法
		* */
		_loadImg: function(item){
			var $item = $(item).removeClass(this._staticConfigs.lazyImgClass),
				imgSrc = $item.attr("data-" + this._staticConfigs.data_attribute);

			function onLoad() {
				$item
					.animate({ opacity: 0 }, 100, function() {
						$item
							.attr('src', imgSrc)// 更新图片
							.animate({ opacity: 1 }, 500, function() {
								//callback
							});
					});
			}

			$("<img />")
				.bind("load", onLoad)
				.attr("src", imgSrc);
		},

		/*
		* 计算img对应的可视范围, 即加载范围
		* */
		_imgVisionHeight: function(img, scrollTop){
			return scrollTop + this._$container[0].clientHeight - img.height * this.configs.threshold;
		},

		_verticalVisible: function(img, scrollTop){
			return img.offsetTop < this._imgVisionHeight(img, scrollTop)
		}
	};
});