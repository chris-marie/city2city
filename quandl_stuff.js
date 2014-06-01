var u = require("underscore");
var Quandl = require("quandl");
var quandl = new Quandl({
    auth_token: "REPLACE_ME",
    api_version: 1
});


var results = null;
quandl.search("zillow rental prices san francisco", {format: 'json'}, function(err, response){
    if(err)
        throw err;

    results = JSON.parse(response);
    //console.log( JSON.stringify(results, null, 4) );
});
function searchAll(query, options, maxPages, callback) {
    var results = null;
    // Get first set of results & determine how many pages remain
    var results = null;

    var requestPage = function(currentPage) {
	quandl.search(query, options, function(err, response){
	    if(err) {
		callback(err, results);
	    }
	    console.log("Fetched page " + currentPage);
	    
	    response = JSON.parse(response);	
	    if(results === null) {
		results = response;
	    } else if(results.docs.length > 0) {
		u.each(response.docs, function(it) {
		    results.docs.push(it);
		});

	    } else {
		results.docs.current_page = currentPage;
		callback(results);
	    }
	    results.docs.current_page = currentPage;
	    if(results.docs.length < results.total_count && currentPage < maxPages - 1) {
		requestPage(currentPage+1);
	    } else {
		callback(results);
	    }
	}); 
    };
    requestPage(0);
}
function getCities(resultArray) {
    var pattern = new RegExp('.*[,\-]+\([^,]+\), *\([A-Z][A-Z]\)');

    var out = u.map(results.docs, function(it) { 
	var newName = it.name.replace(pattern, "$1_$2"); 
	if(newName.indexOf("(") !== -1 || newName.indexOf("-") !== -1 || newName.indexOf(",") !== -1) { 
	    return null;
	} else { 
	    return {'cityName':newName.replace(new RegExp(" ","g"), ""), 'result': it};
	}
    }).filter(function(it) { return it !== null; });
    out = u.groupBy(out, 'cityName');
    u.each(out, function(value, key) { out[key] = u.pluck(value, 'result'); });
    return out;
}

//function getDataForSearchResult(searchResult, callback) {}

// quandl.dataset({
// 	source: "ZILLOW", 
// 	table: "MCOUNTY_NUMBEROFHOMESFORRENT_ALLHOMES_SANFRANCISCOCA"
// },function(err, answer) { 
// 	theAnswer = JSON.parse(answer); 
// 	console.log(answer); 
// });
