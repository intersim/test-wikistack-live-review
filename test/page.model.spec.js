const { db, Page } = require('../models');
const expect = require('chai').expect;

describe('Page model', function () {

	before(function() {
		return db.sync({force: true});
	});

	beforeEach(function(){
		return Page.truncate()
	});

	after(function() {
		return db.sync({force: true});
	});

  describe('Virtuals', function () {
  	let page;

  	beforeEach(function() {
  		page = Page.build();
  	});

    describe('route', function () {
      it('returns the url_name prepended by "/wiki/"', function(){
      	page.urlTitle = 'some_title';
      	expect(page.route).to.equal('/wiki/some_title');
      });
    });

    describe('renderedContent', function () {
      it('converts the markdown-formatted content into HTML', function(){
      	page.content = '# Hello';
      	expect(page.renderedContent.trim()).to.equal('<h1 id="hello">Hello</h1>');
      });
    });
  });

  describe('Class methods', function () {

    describe('findByTag', function () {
	  	beforeEach(function(){
	  		return Page.create({
	  			title: 'foo',
	  			content: 'bar',
	  			tags: ['foo', 'bar']
	  		});
	  	});

      it('gets pages with the search tag', function () {
      	return Page.findByTag('foo')
      	.then(function(pages){
      		expect(pages.length).to.equal(1);
      		expect(pages[0].title).to.equal('foo');
      	});
      });

      it('does not get pages without the search tag', function () {
      	return Page.findByTag('foo')
      	.then(function(pages){
      		expect(pages.length).to.equal(1);
      		expect(pages[0].title).to.not.equal('bar');
      	});
      });
    });
  });

  describe('Instance methods', function () {
    describe('findSimilar', function () {
    	let page;

    	beforeEach(function(){
    		return Promise.all([
    			Page.create({ title: 'dog', content: 'dog', tags: ['mammal'] }),
    			Page.create({ title: 'cat', content: 'cat', tags: ['mammal'] }),
    			Page.create({ title: 'lizard', content: 'lizard', tags: ['reptile'] })
    		])
    		.then(function([dog, cat, lizard]){
    			page = dog;
    		});
    	});

      it('never gets itself', function(){
    		return page.findSimilar()
    		.then(function(similarPages){
    			expect(similarPages[0].title).to.not.equal('dog');
    		});
      });

      it('gets other pages with any common tags', function(){
      	return page.findSimilar()
    		.then(function(similarPages){
    			expect(similarPages.length).to.equal(1);
    			expect(similarPages[0].title).to.equal('cat');
    		});
      });

      it('does not get other pages without any common tags', function(){
      	return page.findSimilar()
    		.then(function(similarPages){
    			expect(similarPages.length).to.equal(1);
    			expect(similarPages[0].title).to.not.equal('lizard');
    		});
      });
    });
  });

  describe('Validations', function () {
    it('errors without title');
    it('errors without content');
    it('errors given an invalid status');
  });

  describe('Hooks', function () {
    it('it sets urlTitle based on title before validating');
  });

});