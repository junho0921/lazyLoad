/**
 * Created by Administrator on 2016/2/12.
 */
function loadImages(imagesScope) {
	$('img[data-lazy]', imagesScope).each(function() {

		var image = $(this),
			imageSource = $(this).attr('data-lazy'),
			imageToLoad = document.createElement('img');

		imageToLoad.onload = function() {// ��ȡͼƬ���Խ��ֵ���ʽ���ص�Ŀ����
			image
				.animate({ opacity: 0 }, 100, function() {// 0.1���Ϊ͸��(���ı䲼��)��callback
					image
						.attr('src', imageSource)// ����ͼƬ
						.animate({ opacity: 1 }, 200, function() {// 0.2�����callbackȥ���ӳټ�������
							image
								.removeAttr('data-lazy')
								.removeClass('slick-loading');
						});
				});
		};

		imageToLoad.src = imageSource;// �趨src������load�¼�

	});
}

$("<img />")
	.bind("load", function() {

		var original = $self.attr("data-" + settings.data_attribute);
		$self.hide();
		if ($self.is("img")) {
			$self.attr("src", original);
		} else {
			$self.css("background-image", "url('" + original + "')");
		}
		$self[settings.effect](settings.effect_speed);

		self.loaded = true;

		/* Remove image from array so it is not looped next time. */
		var temp = $.grep(elements, function(element) {
			return !element.loaded;
		});
		elements = $(temp);

		if (settings.load) {
			var elements_left = elements.length;
			settings.load.call(self, elements_left, settings);
		}
	})
	.attr("src", $self.attr("data-" + settings.data_attribute));
