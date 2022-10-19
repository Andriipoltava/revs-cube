var menuDataHandler = (function($) {
	"use strict";

	var compiledMenus = [];
	var finalMenusList = [];
	var allergenList = [];

	var activePrimaryMenu = null;
	var activeSecondaryMenu = null;

	var pageSlug = '';

	var _PageSlug=function (slug) {
		pageSlug=slug;
	}
	var _slugify = function(string)
	{
		return string.toLowerCase().replace(/[^a-zA-Z 0-9\-]+/g, "")		// Remove special characters
			.replace(/\s/g, "-")		// Replace spaces
			.replace(/(\-){2,}/gi, '-')		// Replace consecutive hyphens with one
			.replace(/^(\-){1,}/gi, '').replace(/(\-){1,}$/gi, '')		// Trim hyphens
	}

	var _BarInfo = function(self, apiId) {
		
		self.query("barInfo", apiId).then(function(data)
		{
			// console.log("%c Bar Info", 'font-weight: bold');
			// console.log(data);
		})
		.done();

	};
	var _MainMenu = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "Main Menu").then(function(data)
		{
			// console.log("%c Bar Food - Main Menu", 'font-weight: bold');
			// console.log(data);

			ProcessMenuItems('Food', 'Main Menu', data);			

		})
		.done();

	};
	var _TwoCourses = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "2 Courses").then(function(data)
		{
			// console.log("%c Bar Food - 2 Courses", 'font-weight: bold');
			// console.log(data);

			ProcessMenuItems('Food', '2 Courses', data);

		})
		.done();

	};
	var _SixPoundLunchMenu = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "£6 Lunch").then(function(data)
		{
			// console.log("%c Bar Food - £6 Lunch Menu", 'font-weight: bold');
			// console.log(data);

			ProcessMenuItems('Food', '£6 Lunch Menu', data);

		})
		.done();

	};
	var _KidsMenu = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "Kids").then(function(data)
		{
			// console.log("%c Bar Food - Kids", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Food', 'Kids', data);

		})
		.done();

	};
	var _BrunchMenu = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "Brunch Menu").then(function(data)
		{
			// console.log("%c Bar Food - Brunch Menu", 'font-weight: bold');
			console.log("Bar ID - " + apiId);
			// console.log(data);
 
			ProcessMenuItems('Food', 'Brunch Menu', data);

		})
		.done();

	};

	var _CubanIconsMenu = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "Cuban Icons").then(function(data)
		{
			// console.log("%c Bar Food - Cuban Icons", 'font-weight: bold');
			// console.log(data);
 
			ProcessMenuItems('Food', 'Cuban Icons', data);

		})
		.done();

	};

	var _SpecialsMenuFood = function(self, apiId) {
		
		self.query("barMenu", apiId, "food", "Vegan Specials Menu").then(function(data)
		{
			// console.log("%c Bar Food - Specials Menu", 'font-weight: bold');
			// console.log(data);
 
			ProcessMenuItems('Food', 'Vegan Specials Menu', data);

		})
		.done();

	};

	// ********* DRINKS *********

	var _MainMenuDrinks = function(self, apiId) {

		self.query("barMenu", apiId, "drink", "Main Menu").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Drink', 'Main Menu', data);

		})
		.done();

	};

	var _SpecialsMenuDrinks = function(self, apiId) {
		
		self.query("barMenu", apiId, "drink", "Specials Menu").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Drink', 'Specials Menu', data);

		})
		.done();

	};

	var _WinesBeersMenuDrinks = function(self, apiId) {
		
		self.query("barMenu", apiId, "drink", "Wines & Beers").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Drink', 'Wines & Beers', data);

		})
		.done();

	};

	var _TheRumStoreMenuDrinks = function(self, apiId) {
		
		self.query("barMenu", apiId, "drink", "The Rum Store").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Drink', 'The Rum Store', data);

		})
		.done();

	};

	var _CubanIconsMenuDrinks = function(self, apiId) {
		
		self.query("barMenu", apiId, "drink", "Cuban Icons").then(function(data)
		{
			// console.log("%c Bar Drink - Cuban Icons", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Drink', 'Cuban Icons', data);

		})
		.done();

	};

	// ********* PARTY *********

	var _WeekdayParty = function(self, apiId) {
		
		self.query("barMenu", apiId, "party", "Mon-Fri").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Fiesta', 'Mon-Fri', data);

		})
		.done();

	};

	var _WeekendParty = function(self, apiId) {
		
		self.query("barMenu", apiId, "party", "Sat-Sun").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Fiesta', 'Sat-Sun', data);

		})
		.done();

	};

	var _CantinaPackages = function(self, apiId) {
		
		self.query("barMenu", apiId, "party", "Cantina Packages").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Fiesta', 'Cantina Packages', data);

		})
		.done();

	};

	var _DrinksPackages = function(self, apiId) {
		
		self.query("barMenu", apiId, "party", "Drinks Packages").then(function(data)
		{
			// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
			// console.log(data);
			
			ProcessMenuItems('Fiesta', 'Drinks Packages', data);

		})
		.done();

	};

	// var _CocktailMasterclass = function(self, apiId) {
	//
	// 	self.query("barMenu", apiId, "party", "Cocktail Masterclass").then(function(data)
	// 	{
	// 		// console.log("%c Bar Drink - Main Menu", 'font-weight: bold');
	// 		// console.log(data);
	//
	// 		ProcessMenuItems('Fiesta', 'Cocktail Masterclass', data);
	//
	// 	})
	// 	.done();
	//
	// };



	var ProcessMenuItems = function(MenuType, MenuSection, menuData) {

		// Sort menus by position
		var data = _.sortBy(menuData, function (o) { return o.position; });

		console.log('menu data', data);

		// Menus tree
		var thisMenu = {
			type: MenuType,
			slug: _slugify(MenuType),
			section: MenuSection
		};

		// Full Allergen List
		var allergens = [];
		if(_.has(data, '0.options.data.0.allergens.data'))
		{
			_.forEach(data[0].options.data[0].allergens.data, function(value) {				
				var allergenDetails = {
					title: value.allergen,
					slug: value.allergen.replace(/[-[\]{}()*+?.,\\/^$|#\s]+/g, '-').toLowerCase(),
					value: value.value
				}
		 		allergens.push(allergenDetails);
		 	});
		}
	 	allergenList = _.uniq(allergens);

	 	// Process Data
	 	var data_assigned_MenuType = MenuType,
	 		data_assigned_MenuSection = [],
	 		data_assigned_SubSections = [],
	 		unique_Categories = [],
	 		data_Items = [];

	  if(_.has(data, '0.categories.data'))
		{
			data_assigned_MenuSection = data[0].categories.data;
		}
	  if(_.has(data, '0.options.data'))
		{
			data_Items = data[0].options.data;
		}

	 	// Sets SubSections
	 	_.forEach(data, function(value) {

			var sortedOptions = _.sortBy(value.options.data, function (o) { return o.position; });

	 		var subsection = {
	 			slug: value.slug,
	 			title: value.title,
	 			description: value.description,
	 			id: value.id,
	 			options: sortedOptions,
	 			categories: []
	 		}

			// Only show Bottomless/Fiesta brunch menus on correct bars
			var fiestaBars = [220, 218, 217];
			if (subsection.slug === "brunch-fiesta" && !fiestaBars.includes(apiId)) {
				return;
			}

			if (subsection.slug === "bottomless-brunch" && fiestaBars.includes(apiId)) {
				return;
			}

			// Increase brunch price to premium for specific bars
			var premiumBars = [227, 210, 205, 202, 211];
			if (subsection.slug === "bottomless-brunch" && premiumBars.includes(apiId)) {
				subsection.description = subsection.description.replace("£30pp", "£35pp");
			}

		  	data_assigned_SubSections = data_assigned_SubSections.concat(subsection);
		});
			

		// Section Categories
		_.forEach(data_assigned_SubSections, function(self) {
			
			// Reposition and Format Categories
			_.forEach(self.options, function(option) {
				_.forEach(option.meta.data, function(category) {
					if (category.name.indexOf('Subsection') !== -1 ){
						var categoryItem = {
							menuSection: self.slug,
							name: category.name,
							cat: category.value,
						};
						unique_Categories = unique_Categories.concat(categoryItem);
					}
				});
				// _.forEach(option.allergens.data, function(item) {
				// 	item = _.replace(item.allergen, /\s+/g, '-');
				// });

				// RDCD-92 - add vegan flag
				option.vegan = false;
				_.forEach(option.allergens.data, function(item) 
				{
					if(item.allergen == 'Vegan' && item.value == 'yes')
					{
						option.vegan = true;
					}
				});
			});
			unique_Categories = _.uniqBy(unique_Categories, 'cat');

			var categories = [];
			_.forEach(unique_Categories, function(category) {
				if (category.menuSection === self.slug) {
					categories.push(category);
				}
			});
			_.merge(self.categories, categories);

		});

		var menus = {};
		menus = {
	 		menuSection: MenuSection,
	 		menuSectionSlug: _slugify(MenuSection),
	 		menuSubsections: data_assigned_SubSections,
	 	};
	 	// Define Final Data Object
	 	var sections = {};

	 	sections = {
	 		menuType: data_assigned_MenuType,
	 		menuTypeSlug: _slugify(data_assigned_MenuType),
	 		menus: [menus],
			pageSlug:pageSlug,
	 		menuAllergens: allergenList
	 	};

	 	compiledMenus = compiledMenus.concat(sections);

	};

	var RenderMenus = function(data) {

		// Get Unique Menus list
		var finalMenusList = _.cloneDeep(compiledMenus);
		finalMenusList = _.uniqBy(finalMenusList, 'menuType');
		_.forEach(finalMenusList, function(type) {
			type.menus = [];
		});

		_.forEach(compiledMenus, function(menu) {
			_.forEach(finalMenusList, function(menuCheck, key) {
				if (_.eq(menu.menuType, menuCheck.menuType)) {
					finalMenusList[key].menus.push(menu.menus[0]);
				}
			});
		});


		// HELPERS
	    Handlebars.registerHelper('ifCond', function(v1, v2, options) {
		  if(v1 === v2) {
		    return options.fn(this);
		  }
		  return options.inverse(this);
		});
		Handlebars.registerHelper('ifNOT', function(v1, v2, options) {
		  if(v1 != v2) {
		    return options.fn(this);
		  }
		  return options.inverse(this);
		});
		 Handlebars.registerHelper('ifContains', function(v1, v2, options) {
		  if(v1.indexOf(v2) > -1) {
		    return options.fn(this);
		  }
		  return options.inverse(this);
		});
		Handlebars.registerHelper('origin', function() {
		 	return window.location.origin;
		});
		Handlebars.registerHelper('formatAllergens', function(str) {
		  return str.replace(/[-[\]{}()*+?.,\\/^$|#\s]+/g, '-').toLowerCase();
		});
		Handlebars.registerHelper('lowercasePlease', function(str) {
		  return str.toLowerCase();
		});
		Handlebars.registerHelper('formatPriceChoices', function(str) {
		  return str.replace(/[,]+/g, ' | ');
		});
		Handlebars.registerHelper('twoDecimalPrice', function(str) {
		  return parseFloat(Math.round(str * 100) / 100).toFixed(2);
		});
		Handlebars.registerHelper('formatDescIcons', function(str) {
		  return str.replace(/(\(g)\)/g, '<img class="icon" src="/wp-content/themes/decuba/app/img/svg/gluten_free.svg" width="17px" height="17px">').replace(/(\(v)\)/g, '<img class="icon" src="/wp-content/themes/decuba/app/img/svg/vegetarian.svg" width="17px" height="17px">').replace(/(\(ve)\)/g, '<img class="icon" src="/wp-content/themes/decuba/app/img/svg/vegan.svg" width="17px" height="17px">').replace(/(\(0\% ABV)\)/gi, '<img class="icon" src="/wp-content/themes/decuba/app/img/svg/ABV.svg" width="17px" height="17px">');
		});

	  	/*
	  	 * Use this to turn on logging: (in your local extensions file)
	  	 */
	  	Handlebars.logger.log = function(level) {
	    	if(level >= Handlebars.logger.level) {
	      		console.log.apply(console, [].concat(["Handlebars: "], _.toArray(arguments)));
	    	}
	  	};
	 	 // DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, 
	  	Handlebars.registerHelper('log', Handlebars.logger.log);
	  	// Std level is 3, when set to 0, handlebars will log all compilation results
	  	Handlebars.logger.level = 0; 

		// Grab the template script
	 	var 	menuTemplateScript = $("#menu-template").html();

	 	// Compile the template
	 	var  	menuTemplate = Handlebars.compile(menuTemplateScript);
		// Pass our data to the template
		var 	menuCompiledHtml = menuTemplate(finalMenusList);

		// Add the compiled html to the page
		$('#menus').html(menuCompiledHtml);

		APP.Mediator.publish('contentInjected', $('#menus').children());
		

		// Functions to fire after menu has been added.
		_menuTabs();
		_menuFiltering();
		_menuAccordians();
		menufilter.init();
		MenuLoadingDone();
		gallery.fullScreen();	

/*
		DON'T DO THIS ANYMORE - DEEPLINKING DOES NOT GUARANTEE THAT INDEX: 0 IS THE ACTIVE VIEW
		if ($(window).width() > 990 ) {
			var $packeryContainer = $('[data-menu-container="0"] .product-menu__container');
			if (!$packeryContainer.hasClass('packed')) {
				$packeryContainer.packery({
					itemSelector: '.menu-block',
				  	percentPosition: true,
				  	transitionDuration: 0
				});
				$packeryContainer.addClass('packed');

				$('[data-menu-container="0"] .product-menu__container .menu-block--image').imagesLoaded( {}, function() {
				  	$packeryContainer.packery();
				});
			}
		}	
*/

		// Addtional horrible hacky Party pro price band code
		if ($('.tapas-desc').length > 0) {

			const tapasOverridePaths = ['/bar/belfast/menus/', '/bar/bristol/menus/', '/bar/liverpool/menus/', '/bar/manchester/menus/']

			if (tapasOverridePaths.includes(window.location.pathname)) {
				$('.tapas-desc').append('<h3>3 for £15 Everyday</h3><p>For 2 people sharing, we recommend 3 tapas as a starter or 6 as a main</p>');
			} else {
				$('.tapas-desc').append('<h3>3 for £15 - Mon - Sat/Sun 2-4-1</h3><p>For 2 people sharing, we recommend 3 tapas as a starter or 6 as a main</p>');
			}
		}


		// Window resize

		$(window).on('resize.packery', function()
		{
			setTimeout(function()
			{
				_packMenuSections();
			}, 500);
		});
	};


	var _packMenuSections = function()
	{
		var $packeryContainer = $('[data-menu-container].open .product-menu__container');
		if (!$packeryContainer.hasClass('packed')) {
			setTimeout(function() {
				$packeryContainer.packery({
					itemSelector: '.menu-block',
				  	percentPosition: true,
				  	transitionDuration: 0
				});
				$packeryContainer.addClass('packed'); 
				$('[data-menu-container].open .product-menu__container .menu-block--image').imagesLoaded( {}, function() {
				  	$packeryContainer.packery();
				  	$packeryContainer.removeClass('packed'); 
				});
			});
		}
		else
		{
			$packeryContainer.packery('reloadItems');
		}
	}

	var _activatePrimaryMenu = function(menuElement)
	{
		var target = $(menuElement).data('menu-slug');
		
		$('[data-menu]').removeClass('open');
		$('[data-menu-container]').removeClass('open');
		$(menuElement).addClass('open');
		activePrimaryMenu = $(menuElement).data('menu-slug');
		activeSecondaryMenu = $("[data-menu-container-slug='" + $(menuElement).data('menu-slug') + "'] [data-menu-section-slug].active").data('menu-section-slug');

		$('[data-menu-container-slug="'+target+'"]').addClass('open');
		$('[data-menu-pattern-slug]').attr('data-menu-pattern-slug', target);			

		if(activePrimaryMenu && activeSecondaryMenu)
		{
			APP.Mediator.publish("trackEvent", ['Menu Interaction', 'view', activePrimaryMenu + ' - ' + activeSecondaryMenu, '', true]);
		}

		_packMenuSections();
	}

	var _activateSecondaryMenu = function(menuElement)
	{
		var targetroot = $(menuElement).closest('[data-menu-container-slug]'),
		target = $(menuElement).data('menu-section-slug'),
		targetRootSlug = $(targetroot).data('menu-container-slug');

//			console.log(targetRootID);

		
		$(targetroot).find('[data-menu-section-slug]').removeClass('active');
		$(targetroot).find('[data-product-menu-slug]').removeClass('active');
		$(menuElement).addClass('active');
		var prevActiveSecondary = activeSecondaryMenu;
		activeSecondaryMenu = $(menuElement).data('menu-section-slug');
		$(targetroot).find('[data-product-menu-slug="'+target+'"]').addClass('active');
		// target download menu
		$('[data-menu-container-slug="'+targetRootSlug+'"]').find('[data-product-menu-slug]').removeClass('active');
		$('[data-menu-container-slug="'+targetRootSlug+'"]').find('[data-product-menu-slug="'+target+'"]').addClass('active');

		if(activePrimaryMenu && activeSecondaryMenu && activeSecondaryMenu !== prevActiveSecondary)
		{
			APP.Mediator.publish("trackEvent", ['Menu Interaction', 'view', activePrimaryMenu + ' - ' + activeSecondaryMenu, '', true]);
		}

		_packMenuSections();
	}


	var _menuTabs = function() {
		$('[data-menu]').on('click.menu', function(event) {
			event.preventDefault();
			_activatePrimaryMenu(this);
			_activateSecondaryMenu($("[data-menu-container-slug='" + $("[data-menu-slug].open").data('menu-slug') + "'] [data-menu-section='0']"))
		});

		// Open relevant section by simulating a click but use a named one so that the
		// interaction tracking event isn't fired
		if(initMenuType && initMenuType.length)
		{
			_activatePrimaryMenu($("[data-menu][data-menu-slug='"+initMenuType+"']"));
		}
		else
		{
			_activatePrimaryMenu($("[data-menu='0']"));
		}

		$('[data-menu-section]').on('click.menu', function(event) {
			event.preventDefault();
			_activateSecondaryMenu(this);
		});
		if(initSubMenuType && initSubMenuType.length)
		{
			_activateSecondaryMenu($("[data-menu-section][data-menu-section-slug='"+initSubMenuType+"']"));
		}
		else
		{
			_activateSecondaryMenu($("[data-menu-container-slug='" + $("[data-menu-slug].open").data('menu-slug') + "'] [data-menu-section='0']"));
		}
	};

	var _menuFiltering = function() {

		var allergens = _.cloneDeep(allergenList);

		//show all categories
		var _showCategories = function(item) {
		 	for (var x = 0; x < item.length; ++x) {
		 		// console.log(items);
		    	$(item[x]).show();
		  	}
		};

		$('.menu-filter__apply').on('click', function(e) {
			e.preventDefault();

			$('[data-menu-container].open').prepend('<div class="menu__filtering loading"></div>')

			var 	ingredients = [],
					ingredientstohide = '';

			if ($('.menu-filter.active .menu-filter__options__option input[type="checkbox"]:checked').length > 0) {
				$('[data-menu-container].open .product-menu-item').removeClass('fade');

				$('.menu-filter.active .menu-filter__options__option input[type="checkbox"]:checked').each(function() {
				  	if (($.inArray($(this).attr('name'), ingredients)) === -1) {
				  		if ($(this).attr('name') === 'vegetarian' || $(this).attr('name') === 'vegan' || $(this).attr('name') === 'glutenfree' ) {
				    		ingredients.push('[data-menu-container].open [data-'+$(this).attr('name')+'="no"]');
				  		} else {
				    		ingredients.push('[data-menu-container].open [data-allergen-'+$(this).attr('name')+'="yes"],[data-menu-container].open [data-allergen-'+$(this).attr('name')+'="may"]');
				  		}
				  	}
					ingredientstohide = ingredients.toString();
				});    

				$(ingredientstohide).addClass('fade');

				// Hide menu blocks that don't have any products left after filtering
				var $menuBlocks = $('.product-menu .menu-block');

				$menuBlocks.each(function () {

					$(this).show();

					var $inneritems = $('.product-menu-item:not(.fade)', this);

					if ($inneritems.length === 0) {
						$(this).hide();
					}
				});


			} else {
				//reset all
				$('[data-menu-container].open .product-menu-item').removeClass('fade');
				$('.product-menu .menu-block').show();

				// _showCategories(allergens);
			}
			menufilter.closeFilters($(this).closest('.menu-filter').find('.menu-filter__tab'));
			//Update grid layout
			_packMenuSections();

			setTimeout(function() {
				$('[data-menu-container].open').find('.menu__filtering').removeClass('loading');
				setTimeout(function() {
					$('[data-menu-container].open').find('.menu__filtering').remove();
				}, 300);
			}, 800);
		});

	};

	var _menuAccordians = function() {

		// if ($(window).width() < 769 ) {
		// 	$('.product-menu__container').each(function(index, el) {

		// 		$(el).find('.menu-block').first().addClass('menuopen');
		// 	});
		// }

		$('.menu-block__toggle').on('click', function(e) {
			e.preventDefault();
			var rootSrc = $(this).closest('.menu-block');
			$(rootSrc).toggleClass('menuopen');

		
		});

	};

	var MenuLoading = function(state) {

		Pace.on('done', function(e) {
			// var timestamp = '[' + Date.now() + '] ';
			// console.log(timestamp);

			RenderMenus(compiledMenus);

		});
	};

	var MenuLoadingDone = function(state) {


	};

	return {
		MenuLoading:MenuLoading,
		MenuLoadingDone:MenuLoadingDone,
		ProcessMenuItems: ProcessMenuItems,
		BarInfo:_BarInfo,
		MainMenu:_MainMenu,
		// TwoCourses:_TwoCourses,
		// SixPoundLunchMenu:_SixPoundLunchMenu,
		// KidsMenu:_KidsMenu,
		BrunchMenu:_BrunchMenu,
		// CubanIconsMenu:_CubanIconsMenu,
		SpecialsMenuFood:_SpecialsMenuFood,
		MainMenuDrinks:_MainMenuDrinks,
		SpecialsMenuDrinks:_SpecialsMenuDrinks,
		WinesBeersMenuDrinks:_WinesBeersMenuDrinks,
		TheRumStoreMenuDrinks:_TheRumStoreMenuDrinks,
		// CubanIconsMenuDrinks:_CubanIconsMenuDrinks,
		// WeekdayParty:_WeekdayParty,
		// WeekendParty:_WeekendParty,
		CantinaPackages:_CantinaPackages,
		DrinksPackages:_DrinksPackages,
		PageSlug:_PageSlug,
		// CocktailMasterclass:_CocktailMasterclass
	};

}(jQuery));


jQuery(document).ready(function($) {
	if ($('#menus').length > 0 ) {
		menuDataHandler.MenuLoading(); 
	}
});