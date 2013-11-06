(function () {
	requirejs.config({
		paths : {
			underscore : 'vendor/underscore/underscore-min',
			backbone : 'vendor/backbone/backbone-min',
			marionette : 'vendor/backbone.marionette/lib/backbone.marionette.min',
			jquery : 'vendor/jquery/jquery.min',
			handlebars: 'vendor/require-handlebars-plugin/Handlebars',
			tpl: '../templates',

			i18nprecompile: 'vendor/require-handlebars-plugin/hbs/i18nprecompile',
			json2: 'vendor/require-handlebars-plugin/hbs/json2',
			hbs: 'vendor/require-handlebars-plugin/hbs'
		},
		shim : {
			jquery : {
				exports : 'jQuery'
			},
			underscore : {
				exports : '_'
			},
			backbone : {
				deps : ['jquery', 'underscore'],
				exports : 'Backbone'
			},
			marionette: {
				deps: ['backbone'],
				exports: 'Backbone.Marionette'
			}
		},
		hbs: {
			templateExtension: "html",
			disableI18n: true,
			disableHelpers: true
		},
		waitSeconds: 15
	});

	require([
		'backbone',
		'marionette',
		'src/App'
	], function (Backbone, Marionette, App) {
		'use strict';

		$(document).ready(function(){
			App.init();
		});
	});
})();