define([
	'backbone',
	'marionette',
	'hbs!tpl/cats',
	'hbs!tpl/cat'
], function (Backbone, Marionette, tmplCats, tmplCat) {
	var MyApp = new Backbone.Marionette.Application();
	var catList = null;

//	INITIALIZE
// ***************************************************************
	MyApp.init = function () {
		catList = new MyApp.AngryCats([
			new MyApp.AngryCat({ name: 'Alfred', image_path: 'http://placehold.it/75x75&text=Alfred' }),
			new MyApp.AngryCat({ name: 'Barbara', image_path: 'http://placehold.it/75x75&text=Barbara' }),
			new MyApp.AngryCat({ name: 'Charlie', image_path: 'http://placehold.it/75x75&text=Charlie' })
		]);

		catList.add(new MyApp.AngryCat({
			name: 'Darwin',
			image_path: 'http://placehold.it/75x75&text=Darwin',
			rank: catList.size() + 1
		}));

		MyApp.start({cats: catList});
	};

	MyApp.addRegions({
		mainRegion: "#content"
	});

	MyApp.addInitializer(function(){
		var angryCatsView = new MyApp.AngryCatsView({
			collection: catList
		});

		MyApp.mainRegion.show(angryCatsView);
	});


//	CATS!!
// ***************************************************************
	MyApp.AngryCat = Backbone.Model.extend({
		defaults: {
			votes: 0
		},

		addVote: function(){
			this.set('votes', this.get('votes') + 1);
		},

		removeVote: function(){
			if (this.get('votes') <= 0) {
				return true;
			}

			this.set('votes', this.get('votes') - 1);
		},

		rankUp: function() {
			this.set({rank: this.get('rank') - 1});
		},

		rankDown: function() {
			this.set({rank: this.get('rank') + 1});
		}
	});

	MyApp.AngryCatView = Backbone.Marionette.ItemView.extend({
		template: tmplCat,
		tagName: 'tr',
		className: 'angry_cat',

		events: {
			'click .rank_up img': 'rankUp',
			'click .rank_down img': 'rankDown',
			'click a.disqualify': 'disqualify'
		},

		initialize: function(){
			this.listenTo(this.model, "change:votes", this.render);
		},

		rankUp: function(){
			this.model.addVote();
			MyApp.vent.trigger("rank:up", this.model);
		},

		rankDown: function(){
			this.model.removeVote();
			MyApp.vent.trigger("rank:down", this.model);
		},

		disqualify: function(){
			MyApp.vent.trigger("cat:disqualify", this.model);
			this.model.destroy();
		}
	});

	MyApp.AngryCatsView = Backbone.Marionette.CompositeView.extend({
		tagName: "table",
		id: "angry_cats",
		className: "table-striped table-bordered",
		template: tmplCats,
		itemView: MyApp.AngryCatView,

		appendHtml: function(collectionView, itemView){
			collectionView.$("tbody").append(itemView.el);
		}
	});

	MyApp.AngryCats = Backbone.Collection.extend({
		model: MyApp.AngryCat,

		initialize: function(cats){
			var rank = 1;
			_.each(cats, function(cat) {
				cat.set('rank', rank);
				++rank;
			});

			this.on('add', function(cat){ if( ! cat.get('rank') ) console.error("Cat must have a rank defined before being added to the collection"); });

			var self = this;

			MyApp.vent.on("rank:up", function(cat){
				if (cat.get('rank') == 1) {
					// can't increase rank of top-ranked cat
					return true;
				}
				self.rankUp(cat);
				self.sort();
			});

			MyApp.vent.on("rank:down", function(cat){
				if (cat.get('rank') == self.size()) {
					// can't decrease rank of lowest ranked cat
					return true;
				}
				self.rankDown(cat);
				self.sort();
			});

			MyApp.vent.on("cat:disqualify", function(cat){
				var disqualifiedRank = cat.get('rank');
				var catsToUpRank = self.filter(
					function(cat){ return cat.get('rank') > disqualifiedRank; }
				);
				catsToUpRank.forEach(function(cat){
					cat.rankUp();
				});
				self.trigger('reset');
			});
		},

		comparator: function(cat) {
			return cat.get('rank');
		},

		rankUp: function(cat) {
			// find the cat we're going to swap ranks with
			var rankToSwap = cat.get('rank') - 1;
			var otherCat = this.at(rankToSwap - 1);

			// swap ranks
			cat.rankUp();
			otherCat.rankDown();
		},

		rankDown: function(cat) {
			// find the cat we're going to swap ranks with
			var rankToSwap = cat.get('rank') + 1;
			var otherCat = this.at(rankToSwap - 1);

			// swap ranks
			cat.rankDown();
			otherCat.rankUp();
		}
	});

	return MyApp;
});