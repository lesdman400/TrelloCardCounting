var departments = {
	"depCrestline":"",
	"depFarmersAlmanac": "",
	"depGeiger":"CorporateProgramsProgramManagersGroup1,CorporateProgramsProgramManagersGroup2,CorporateProgramsProgramManagersGroup3,CorporateProgramsProgramManagersPSG,CorporateProgramsWeb&GraphicsGroup1,CorporateProgramsWeb&GraphicsGroup2,CorporateProgramsCustomerAdvocates,AssistantProgramManagers&AdminAssistant,CorporateProgramsInventory&Pricing",
	"depSupport":"",
}

var teams = {
	// TEST Team
	// "CPWEB":"bobdagget,jeffpatterson,pedmands,lesliemercier,preston409,johnpaine5,lesliemercier,johnathanplummer,dawnlaprell,mikefrench,mikeplourde,scottstowe,jallen19,alangroudle,tylerturcotte,jessicalevy10,kevinmcgrory,sthompsongeiger1",
	"Graphics": "",
	"Marketing/Brand/Data": "",
	"Sales": "",
	"SalesSupport": "",
	"Farmers'Almanac": "",
	"CorporateProgramsProgramManagersGroup1": "charlenedion,christamatuszewski,kimberlyblais,marcylavallee,kevinboilard,ryanmockler,sarahcouturier",
	"CorporateProgramsProgramManagersGroup2": "jonisatterthwaite,kaitlynnegibson1,rachellepower,kmillercraft,scottlaberge,stelladuclos",
	"CorporateProgramsProgramManagersGroup3": "jamesayotte3,justinfortier5,kellysutton3,nikkihamlin,rkilgore,theajones1",
	"CorporateProgramsProgramManagersPSG": "crystalparadis,erinhutchinson,bshuster1,julianarua,juliestinson1,jvickers1,kevinboilard,priscillakistner,jenruler1,ambryant,stephaniehobbs,wendythorne,traceydespres,reneeperdicaro1",
	"CorporateProgramsWeb&GraphicsGroup1": "dawnlaprell,mikefrench,sthompsongeiger1,mikeplourde,johnpaine5,preston409,scottstowe",
	"CorporateProgramsWeb&GraphicsGroup2": "alangroudle,jallen19,jessicalevy10,johnathanplummer,lesliemercier,tylerturcotte,kevinmcgrory",
	"CorporateProgramsCustomerAdvocates": "amandapaul,andreasands2,hcote2,heidi96961679,madisonsawyer,pamelamorris4",
	"AssistantProgramManagers&AdminAssistant": "amyrioux4,brandivachon,jrbourgoin,joshnickerson3,rubyphillips,scottsmith209",
	"CorporateProgramsInventory&Pricing": "bevhemond,kaseyplourde,katherineparlove,katiedoucette1",
	"RiskManagement": "",
	"DC": "",
	"Finance": "",
	"Marketing": "",
	"TotalCareA/P&FreightPayables": "",
	"TotalCareA/R": "",
	"TotalCareBillingGroup": "",
	"TotalCareClaims": "",
	"TotalCareCRSThinkTankElite": "",
	"TotalCareCRSTurnItUp": "",
	"TotalCareCRSMightyGreenDots": "",
	"TotalCareCRSConceptCrew": "",
	"TotalCareCRSEastFlorida": "",
	"TotalCareCRSDefendersofTrello": "",
	"TotalCareCRSMellowTrello": "",
	"TotalCareCRSWest": "",
	"TotalCareCRSLewiston": "",
	"TotalCareCRSServiceNow": "",
	"TotalCareOrderExpediting": "",
	"TotalCareOrderVerifier": "",
	"CorporateFinance": "",
	"ExMgmt&AdminServices": "",
	"VendorRelations": "",
	"HR/OD/OS": "",
	"ITEcommerce": "",
	"ITHelpdesk/WebApps/NOC": "",
	"ProductData": ""
};

var key = "";
var token = "";

/**
 * Main function to retrieve and process Trello REST API Data
 */
function RetrieveTrelloData(){
	let dctMemberDetails = {};
	let memberList = [];
	if(departments[$("#teamName")[0].value] !== undefined){
		if(departments[$("#teamName")[0].value].length > 0){
			let tmpMemberList = [];
			let departmentList = departments[$("#teamName")[0].value].split(",")
			$.each(departmentList, function(id){
				if(id!==0){tmpMemberList += ",";}
				tmpMemberList+=teams[departmentList[id]].split(",");
			});
			memberList = tmpMemberList.split(",");
		}else{
			console.log("No teams found for Department: " + $("[value="+$("#teamName")[0].value+"]").html());
			alert("No teams found for Department: " + $("[value="+$("#teamName")[0].value+"]").html());
		}
	}else if(teams[$("#teamName")[0].value] !== undefined){
		if(teams[$("#teamName")[0].value].length > 0){
			memberList =  teams[$("#teamName")[0].value].split(",");
		}else{
			console.log("No teams found for Department: " + $("[value="+$("#teamName")[0].value+"]").html());
			alert("No teams found for Department: " + $("[value="+$("#teamName")[0].value+"]").html());
		}
	}else{
		console.log("No department/team info was found!");
		alert("No department/team info was found!");
	}

	if(memberList.length > 0){
		let memberURLS = createURLs(memberList, "member");
		getMemberData(memberURLS, memberList, dctMemberDetails, getCardData);
	}
}

/**
 * Retrieve Trello member data and place fullName, and id in the dctMemberDetails dictionary
 * @param  {List}   urls             List of Trello member urls that are split up by 10 queries per url. 
 *                                     Note trello can only process 10 different requests in 1 batch call so multiple 
 *                                     batch calls are needed in the form of different urls. Note urls are shifted off after being used to eliminate the needed
 *                                     for keeping track of current index between ajax calls
 * @param  {List}   memberList       List of member user names. If there are no member details for a user name
 *                                     then fullName is set to the current member in the member List. Members are shifted off the list after
 *                                     being processed. (Removes the need to keep track of an index and iterate through the list; by being able to pick the first element)
 * @param  {Dictionary}   dctMemberDetails Dictionary populated when retriving memberData. At this point the key will be the username, and the value will be a dictionary
 *                                     of the users id, fullName, and card stats
 * @param  {Function} callback         Function getCardData(urls, memberList, dctMemberDetails, callback) called after getMemberData is finished passing in a new url set, refershed memberList
 *                                     the current dctMemberDetails and the writeData function
 */
function getMemberData(urls, memberList, dctMemberDetails, callback){
	/**
	 * Jquery ajax call to retrive a jsonData object from Trello's REST API containing member data which is then stored in dctMemberDetails
	 * @param  {json} jsonData Member Data containing member information retrivied with their username.
	 */
	$.get("https://api.trello.com/1/batch/?urls="+urls[0]+"&pluginData&key="+key+"&token="+token).done(function(jsonData){
		//Store member data in dctMemberDetails
		$.each(jsonData, function(id){
			if(jsonData[id].hasOwnProperty("200")){
				if(dctMemberDetails[jsonData[id][200].username] === undefined){
					dctMemberDetails[jsonData[id][200].username] = {};
					dctMemberDetails[jsonData[id][200].username]["id"] = jsonData[id][200].id;
					if(jsonData[id][200].fullName !== null){
						dctMemberDetails[jsonData[id][200].username]["fullName"] = jsonData[id][200].fullName;
					}else{
						dctMemberDetails[jsonData[id][200].username]["fullName"] = memberList[0];
					}
				}
			}else{
				if(dctMemberDetails[memberList[0]] === undefined){
					dctMemberDetails[memberList[0]] = {"id":"", "fullName": memberList[0] +" not found"};
				}
			}
			memberList.shift();
		});
		urls.shift();

		//Run next url if exists
		if(urls.length > 0){
			getMemberData(urls, memberList, dctMemberDetails, callback);
		}else{
			//Create memberList from dctMemberDetails keys
			memberList = Array.from(Object.keys(dctMemberDetails));
			callback(createURLs(memberList,"card"), memberList, dctMemberDetails, writeData);
		}

	});
}

/**
 * Retrieve Trello card data and place, new, implementing, completed, and parked stats in dctMemberDetails
 * @param  {List}   urls             List of Trello card urls that are split up by 10 queries per url. 
 *                                     Note trello can only process 10 different requests in 1 batch call so multiple 
 *                                     batch calls are needed in the form of different urls. Note urls are shifted off after being used to eliminate the needed
 *                                     for keeping track of current index between ajax calls
 * @param  {List}   memberList       List of member user names used to identify the current member in the jsonData list retrieved from the Trello REST API
 *                                     Members are shifted off after stats have been calculated and data entered into dctMemberDetails
 * @param  {Dictionary}   dctMemberDetails Dictionary populated when card stats have been calculated
 * @param  {Function} callback         writeData(dctMemberDetails) uses dctMemberDetails to write data to an html page
 */
function getCardData(urls, memberList, dctMemberDetails, callback){
	/**
	 * Jquery ajax call to retrive a jsonData object from Trello's REST API containing card data which is then stored in dctMemberDetails
	 * @param  {json} jsonData Card Data returned from Trello doesn't contain the username it was retrieved for, we rely on memberList to provide that info. If no data was
	 *                           retrived for a user name it still appears in the json object as an error or empty object.
	 */
	$.get("https://api.trello.com/1/batch/?urls="+urls[0]+"&pluginData&key="+key+"&token="+token).done(function(jsonData){
		$.each(jsonData, function(id){
			let completedCount = 0;
			let inprogressCount = 0;
			let newCount = 0;
			let parkedCount = 0;
			if(jsonData[id].hasOwnProperty("200") && jsonData[id][200]["length"] > 0){
				let member = jsonData[id];
				$.each(member[200], function(cardID){
					let card = member[200][cardID];
					if(card.idList === "4f07af90ffd434f16d00745d"){
						//Completed Green Label
						completedCount++;
					}else if(card.idList === "4f07af90ffd434f16d00745b"){
						//New Idea list - no labels yet
						newCount++;
					}else if(card.idList === "4f07af90ffd434f16d00745c"){
						//Implementing (Yellow Label)
						inprogressCount++;
					}else if(card.idList === "4f07afc9ffd434f16d0076af"){
						//Parked (Red Label)
						parkedCount++;
					}else{
						//Unknown
						console.log("Card:"+card.name+" not apart of list");
					}
				});
			}
			dctMemberDetails[memberList[0]]["completed"] = completedCount;
			dctMemberDetails[memberList[0]]["new"] = newCount;
			dctMemberDetails[memberList[0]]["implementing"] = inprogressCount;
			dctMemberDetails[memberList[0]]["parked"] = parkedCount;
			memberList.shift();

		});
		urls.shift();

		//Run next url if exists
		if(urls.length > 0){
			getCardData(urls, memberList, dctMemberDetails, callback);
		}else{
			callback(dctMemberDetails);
		}
	});
}

/**
 * Create a list of urls split up so each url contains 10 REST API queries. This will be run in a batch call
 * @param  {List} lstMembers list of member usernames to create the url
 * @param  {String} type       "card" or "member" used in a switch case to identify if a card or member url needs to be created
 * @return {List}            Returns a list of urls
 */
function createURLs(lstMembers, type){
	let tmpURL = "";
	var lstURL = [];
	$.each(lstMembers, function(id){
		if(id!==0 && id%10===0){
			lstURL.push(tmpURL);
			tmpURL="";
		}
		if(id%10!==0){tmpURL+=",";}
		switch(type){
			case "card":
				tmpURL += "/members/"+lstMembers[id]+"/cards?filter=open";
				break;
			case "member":
				tmpURL += "/members/"+lstMembers[id];
				break;
			default:
		}
		if(lstMembers.length === id+1){
			lstURL.push(tmpURL);
		}
	});
	return lstURL;
}

/**
 * Write dctMemberDetails data to html
 * @param  {Dictionary} dctMemberDetails dictionary of Member Details, including username, fullname, id, and card statistics
 */
function writeData(dctMemberDetails){
	$.each(dctMemberDetails, function(key, val){
		//Update Result If Exists else make new row
		if($("#results #tblResults tr :contains("+val['fullName']+")").length > 0){
			$("#results #tblResults tr :contains("+val['fullName']+")").parent().html("<td>"+val["fullName"]+"</td><td>"+val["new"]+"</td><td>"+val["implementing"]+"</td><td>"+val["completed"]+"</td><td>"+val["parked"]+"</td>");
		}else{
			$("#results #tblResults tr:last").after("<tr><td>"+val["fullName"]+"</td><td>"+val["new"]+"</td><td>"+val["implementing"]+"</td><td>"+val["completed"]+"</td><td>"+val["parked"]+"</td></tr>");
		}
	});
	
	//Mark users "not found" in red
	if($("#results #tblResults tr :contains(not found)").length > 0){
		$("#results #tblResults tr :contains(not found)").css("background-color","rgba(255,0,0,0.3)");
	}
}

/**
 * Reset html table #tblResults
 */
function ResetTable(){
	$("#tblResults").html("<tr><th>User</th><th>New</th><th>Implementing</th><th>Completed</th><th>Parked</th></tr>");
}

//One User: https://api.trello.com/1/members/lesliemercier/cards?filter=open&label_field=color&key=d4f209847898216931bdaf7a0e99f2c4&token=c9b77afc25e389082291875dd4943220ac3f750ff651260f5ae919da86132e28");
//Multiple Users (Batch): https://api.trello.com/1/batch/?urls=/members/lesliemercier/cards?filter=all,/members/johnathanplummer/cards?filter=all/pluginData&key=[d4f209847898216931bdaf7a0e99f2c4]&token=[c9b77afc25e389082291875dd4943220ac3f750ff651260f5ae919da86132e28]
