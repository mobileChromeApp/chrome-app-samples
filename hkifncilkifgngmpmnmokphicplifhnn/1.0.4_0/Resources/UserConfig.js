
/**
 * @author Dewesh Kumar
 */

/*
Description:isCreated-Corrosponding div is loading first time or has been created
*/
var SectionDetailsArray = [
		{name: "Top Stories", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=newsmldefault&format=simplejson",divId:"divNews",cachedData:null},
		{name: "City", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128932452&format=simplejson",divId:"divNews",cachedData:null,hasSubSection:1},
		{name: "India" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128936835&format=simplejson",divId:"divNews",cachedData:null},
		{name: "World" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=296589292&format=simplejson",divId:"divNews",cachedData:null},
		{name: "Business" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=1898055&format=simplejson",divId:"divNews",cachedData:null},
		
		{name: "Tech" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=5880659&format=simplejson",divId:"divNews",cachedData:null},
		{name: "Cricket" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=4719161&format=simplejson",divId:"divNews",cachedData:null},
		
		{name: "Sports" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=4719148&format=simplejson",divId:"divNews",cachedData:null},
		{name: "Entertainment" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=1081479906&format=simplejson",divId:"divNews",cachedData:null},
		{name: "Movie Reviews", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=135762",divId:"divNews",cachedData:null,hasSubSection:1},
		{name: "Life & Style" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2886704&format=simplejson",divId:"divNews",cachedData:null},
		{name: "Opinion" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=784865811&format=simplejson",divId:"divNews",cachedData:null},
		{name: "Most Popular" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=newsmlfeedmostcomment&format=simplejson",divId:"divNews",cachedData:null},
		
		{name: "Photos" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=newsmldefault",divId:"divNews",cachedData:null,hasSubSection:1},
		{name: "Videos" ,url : "http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3812890&format=flv&videotype=1",divId:"divNews",cachedData:null,hasSubSection:1},
		
		{name: "Ahmedabad", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128821153&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Allahabad", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3947060&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Bangalore", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128833038&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Bhubaneswar", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=4118235&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Chandigarh", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128816762&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Chennai", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2950623&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Coimbatore", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=7503091&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Delhi", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128839596&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Goa", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3012535&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Gurgaon", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=6547154&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Guwahati", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=4118215&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Hubli", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3942695&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Hyderabad", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128816011&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Indore", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=9644624&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Jaipur", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3012544&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Kanpur", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3947067&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Kochi", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=9710057&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Kolkata", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128830821&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Kozhikode", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=9710567&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Lucknow", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128819658&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Ludhiana", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3947051&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Madurai", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=9632514&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Mangalore", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3942690&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Mumbai", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128838597&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Mysore", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3942693&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Nagpur", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=442002&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Noida", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=8021716&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Patna", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128817995&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Pune", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=-2128821991&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Rajkot", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3942663&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Ranchi", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=4118245&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Surat", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3942660&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Thane", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3831863&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Thiruvanthapuram", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=878156304&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Vadodara", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3942666&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		{name: "Varanasi", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=3947071&format=simplejson",divId:"divNews",cachedData:null,isCityName:1},
		
		{name: "Awards", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=5479755",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Beauty", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2371373",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Celebrities", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2371672",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Events", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2048921",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Fashion", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2371395",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Gadgets", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2052830",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Most Viewed", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=newsmlfeedmostviewedhp",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Movies", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2048925",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "News", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2048895",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Parties", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2048923",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "Sports", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2048907",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		{name: "TV", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/photofeed?newsid=2371820",divId:"divNews",cachedData:null,isPhotoSubSection:1},
		
		{name: "Auto", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3813454&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Business", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3813458&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Celebs", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=4015940&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Entertainment", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3812908&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Featured", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3812890&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		//{name: "Funny", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3845931&format=mp4&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		//{name: "Lifestyle", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3813443&format=mp4&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Most Viewed", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=rssfeedsmostviewedvideo&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Movies", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3813445&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "News", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3812907&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		{name: "Sports", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/videojsonfeed?videoid=3813456&format=flv&videotype=1",divId:"divNews",cachedData:null,isVideoSubSection:1},
		
		
		{name: "Bengali", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2742914",divId:"divNews",cachedData:null,isMovieReviewSubSection:1},
		{name: "English", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2742918",divId:"divNews",cachedData:null,isMovieReviewSubSection:1},
		{name: "Hindi", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2742919",divId:"divNews",cachedData:null,isMovieReviewSubSection:1},
		{name: "Kannada", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2742917",divId:"divNews",cachedData:null,isMovieReviewSubSection:1},
		{name: "Marathi", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=5567826",divId:"divNews",cachedData:null,isMovieReviewSubSection:1},
		{name: "Tamil", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2742916",divId:"divNews",cachedData:null,isMovieReviewSubSection:1},
		{name: "Telugu", url :"http://mfeeds.timesofindia.indiatimes.com/Feeds/jsonfeed?newsid=2742911",divId:"divNews",cachedData:null,isMovieReviewSubSection:1}
		]
//This will store the array of urls of selected album
var PhotosListOfSelectedAlbum;
var TempData = "Resources/TempData.txt";
var CachedItemIndices = new Array();
var AdUrlListing = "http://ads.toi.cntdy.mobi/adserver/www/delivery/requestad.php?medium=toixml&publisher=49&zone=82";
var AdUrlStory = "http://ads.toi.cntdy.mobi/adserver/www/delivery/requestad.php?medium=toixml&publisher=49&zone=83";
var bannerUrlListing;
var bannerListingRedirect;
var bannerUrlStory;
var bannerStoryRedirect;

function isBrowser()
{
	if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent))
		{ //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
			var ffversion=new Number(RegExp.$1) // capture x.x portion and store as a number
			if (ffversion >= 3) {
			return true;
		}
		else {
			return false;
		}
		}
else
		return false;
}