var packages = (function ($) {
  var packages_slider = false;

  var init = function () {
    if (
      $(window).width() < 1400 ||
      $(".packages__container .package").length > 4
    ) {
      _initSlider();
    }

    $(window).resize(function () {
      if (
        $(window).width() < 1400 ||
        $(".packages__container .package").length > 4
      ) {
        _initSlider();
      } else {
        if (packages_slider) {
          packages_slider.trigger("destroy.owl.carousel");
          packages_slider = false;
        }
      }
    });

    var isLocationSet = false;
    var storedBar = false;
    var locationData = {};
    var pb2Bars = [
      "birmingham",
      "bristol",
      "leeds",
      "liverpool",
      "manchester",
      "norwich",
      "reading",
    ];

    if (Cookies.get("savedLocation")) {
      var cookie = JSON.parse(Cookies.get("savedLocation"));
      if (!cookie.hasOwnProperty("version") || cookie.version < CookieVersion) {
        Cookies.remove("savedLocation");
      } else {
        isLocationSet = true;
        locationData = cookie;
        var bar = _.filter(Bars, { api_id: parseInt(locationData["api_id"]) });
        if (bar.length != 0) {
          storedBar = bar[0];
        }
      }
    }

    $(document).on('click', 'a[href*="#"]', function (e) {
      e.preventDefault();
      const id = $(this).attr('href');
      if ($(id).length)
        $('html,body').animate({scrollTop: $(id).offset().top}, 500);
    });

    $(".packages__container .package").each(function () {
      if (isLocationSet) {
        var barName = storedBar.bar_name.toLowerCase();

        if (pb2Bars.includes(barName)) {
          var price = $(".package__pb2price", this).text().trim();

          if (price && price !== "") {
            $(".tag--price", this).contents().last().replaceWith(price);
          }
        }
      }
    });

    if (isLocationSet) {
      var barName = storedBar.bar_name.toLowerCase();

      if (pb2Bars.includes(barName)) {
        var pb2url = $("a.packages__download").data("pb2-url");
        $("a.packages__download").attr("href", pb2url);
      }
    }
  };

  var _initSlider = function () {
    $(".packages__container").each(function (index, el) {
      $(this).addClass("owl-carousel");
      var items;

      if ($(this).find(".package").length === 2) {
        items = 1;
      } else {
        items = 2;
      }
      if ($(this).find(".package").length <= 4) {
        desktopLoop = false;
        customClass = "desk--less--4";
        desktopAutoplay = false;
      } else {
        desktopLoop = true;
        customClass = "desk--more--4";
        desktopAutoplay = true;
      }

      packages_slider = $(this).owlCarousel({
        items: 1,
        loop: desktopLoop,
        margin: 0,
        stagePadding: 20,
        rewind: false,
        autoplayHoverPause: true,
        autoplayTimeout: 5000,
        autoplaySpeed: 1000,
        stageOuterClass: "owl-stage-outer " + customClass,
        responsive: {
          768: {
            items: items,
            stagePadding: 0,
          },
          1024: {
            items: 2,
            stagePadding: 0,
          },
          1200: {
            items: 3,
            stagePadding: 0,
            autoplayHoverPause: true,
            autoplay: false,
            loop: false,
          },
          1400: {
            stagePadding: 0,
            items: 4,
            margin: 0,
            autoplayHoverPause: true,
            autoplay: desktopAutoplay,
            loop: desktopLoop,
          },
          // 1670:{
          // 	stagePadding: 150,
          // 	items: 4,
          // 	margin: 0,
          // }
        },
      });

      var navPrev = $(this).closest(".packages").find(".packages__nav__prev");
      var navNext = $(this).closest(".packages").find(".packages__nav__next");
      var navCenter = $(this)
        .closest(".packages")
        .find(".packages__nav__center");

      $(navPrev).on("click", function () {
        packages_slider.trigger("prev.owl.carousel");
      });

      $(navNext).on("click", function () {
        packages_slider.trigger("next.owl.carousel");
      });

      $(navCenter).on("click", function () {
        packages_slider.trigger("to.owl.carousel", 0);
      });
    });

    packages_slider.on("changed.owl.carousel", function (event) {
      var element = event.target;

      if (!$(element).hasClass("interacted")) {
        $(element).addClass("interacted");
        $(element).children(".finger-prompt").removeClass("active");
        setTimeout(function () {
          $(element).children(".finger-prompt").remove();
        }, 600);
      }
    });
  };


  return {
    init: init,
  };
})(jQuery);

jQuery(document).ready(function ($) {
  if ($(".packages__container").length > 0) {
    packages.init();
  }
});
