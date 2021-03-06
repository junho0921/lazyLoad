define(function(require, exports, module){
	/**
	 * @class LazyLoad
	 * 版本1.00
	 * @memberof Nuui
	 * @classdesc 图片延迟加载, 仅对在显示区域内的图片进行加载<br/>
	 * 		延迟加载的图片标签的书写格式:<br/>
	 * 		1, 添加lazy类<br/>
	 *		2, 添加属性data-original, 值为所加载的图片路径<br/>
	 *		3, 延迟加载图片的src值是预置图, 优先于配置的预置图configs.placeHolder<br/>
	 *		示范: `<img class='lazy' data-original='./img/01.jpg'/>`<br/>
	 *		注意点:<br/>
	 *		1, container须有滚动属性;<br/>
	 *		2, 延迟加载的图片须设近似所加载图片高度的min-height;<br/>
	 * @param {object} configs - 配置
	 * @param {string} configs.container - 图片浏览滚动的容器的css选择器字符串<br/>
	 * @param {number} configs.threshold - 图片露出多少比例才加载的系数, 默认值是0.5 <br/>
	 * @param {string} configs.placeholder - 未加载的图片的预置图路径, 也接收base64位图的字符串, 默认是灰色底图片<br/>
	 * @example var imgLoader = new LazyLoad({
	 * 		container: '#imgContainer',
	 * 		threshold: 0.3,
	 * 		placeholder: './img/placeholder.png'
	 * 	});
	 */
	var LazyLoad = module.exports = function(configs){

		this.configs = $.extend({}, this._defaultConfigs, configs);
		
		this.updateItems = $.proxy(this.updateItems, this);
		
		this.init();

		return this;
	};

	LazyLoad.prototype = {

		constructor: LazyLoad,
		
		_staticConfigs:{
			eventType: 'scroll.LazyLoad',
			data_attribute: "original",
			lazyImgClass: 'lazy'
		},
		
		_defaultConfigs: {
			container: window,
			threshold: 0.5,
			placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
		},

		/*
		* 未加载的img的位置数组
		* */
		_imgPos : null,

		init: function(){
			this._$container = $(this.configs.container);

			this.updateItems();

			this._bindEvent();
		},

		/*
		* 过滤items中标记已加载的item
		* */
		_itemsFilter: function(){
			var temp = $.grep(this._$items, function(item) {
				return !item.lazyLoaded;
			});
			this._$items = $(temp);//console.log('清理后的$item ',this._$items);
		},

		/*
		* 绑定事件
		* */
		_bindEvent: function(){
			this._$container.on(this._staticConfigs.eventType, $.proxy(this._onScroll, this));

			$(window).on("resize", $.proxy(this._updateImgPos, this));// TO check
		},

		/*
		* 滚动容器触发的检测加载图片方法
		* */
		_onScroll: function(){
			var len = this._imgPos.length;
			if(!len)return;

			// 计算现在显示的区域
			var loadEdgeH = this._$container.scrollTop() + this._visionH;
			var loadEdgeW = this._$container.scrollLeft() + this._visionW;
			function horizontalVisible(img){return img.left < loadEdgeW}
			function verticalVisible(img){return img.top < loadEdgeH}

			for(var i = 0; i < len; i++){ // 逻辑: 先检测img是否在水平可视范围, 后检测img是否在垂直可视范围
				var img = this._imgPos[i];
				if(horizontalVisible(img)){
					if(verticalVisible(img)){
						this._loadImg(img.el);
					} else {
						break; // 当遍历到可视范围内右下角的图片, 便停止遍历
					}
				}
			}
		},

		/*
		* 加载图片方法
		* */
		_loadImg: function(item){
			if(item.lazyLoaded){return}

			var
				_this = this,
				$item = $(item),
				imgSrc = $item.attr("data-" + this._staticConfigs.data_attribute);

			// 标记已加载
			item.lazyLoaded = true;

			this._itemsFilter();

			$item.addClass('loadingImg');// 检测显示标记

			function onLoad() {
				$item
					.animate({ opacity: 0 }, 100, function() {
						$item
							.attr('src', imgSrc)// 更新图片
							.addClass('wellDone')
							.removeClass('loadingImg')// 检测显示标记
							.animate({ opacity: 1 }, 500, function() {
								//callback
							});
						_this._updateImgPos();
					});
			}

			$("<img />")
				.bind("load", onLoad)
				.attr("src", imgSrc);
		},

		/*
		* 获取未加载图片的位置, 保存在缓存里
		* */
		_updateImgPos: function(){
			var imgPos = this._imgPos = [];

			this._$items.each(function(i, item){
				imgPos.push({
					el: item,
					top: item.offsetTop,
					left: item.offsetLeft
				});
			});//console.log(imgPos)
		},

		/*
		* 计算可视范围, 即加载范围
		* */
		_calcVisionSize: function(){
			var placeHolderImgSize = {
				width: this._$items.width(),
				height: this._$items.height()
			};

			this._visionH = this._$container[0].clientHeight - placeHolderImgSize.height * this.configs.threshold;
			this._visionW = this._$container[0].clientWidth - placeHolderImgSize.width * this.configs.threshold;
		},

		/**
		 * @desc 更新需要延迟加载的图片, 用于在刷新页面或页面再加载后使用
		 * @memberof Nuui.LazyLoad
		 * @func updateItems
		 * @instance
		 */
		updateItems: function(){
			var placeholderImg = this.configs.placeholder;
			// 获取所有img
			if(this._$items = this._$container.find('img.' + this._staticConfigs.lazyImgClass)){
				// 过滤已加载的img
				this._itemsFilter();

				// 计算可视范围
				this._calcVisionSize();

				// 给未加载图的添加底图
				this._$items.each(function(i, item){
					item.src = item.src || placeholderImg;
				});

				// 更新未加载图的位置
				this._updateImgPos();

				// 执行一次scroll方法, 给刚初始化时候容器可视区域内的图片加载
				this._onScroll();
			}
		}
	};
});