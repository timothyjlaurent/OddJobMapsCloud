
var dat = require('/dat');
var login = require('/ui/common/login');

exports.createManageWindow = function() {
	var Cloud = require('ti.cloud');
	Cloud.debug = true;
	var token = dat.getMyStoredAccessToken();
	// Create a user
	// ACS app must be configured to use 3-legged OAuth
	if (token) {

		Cloud.accessToken = token;
		// Ti.App.fireEvent('loggedIn',{});

	} else {

		login.createLoginWindow();

	}
	
	var win = Ti.UI.createWindow({
		title : 'Manage Jobs',
		backgroundColor : "white",
		layout : 'vertical'
	});
	
	var view = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : '95%'
	});
	
	win.add(view);
	
	showEntries(view);
	
	win.open();

	var backBtn = Ti.UI.createButton({
		title : 'Back',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});

	backBtn.addEventListener('click', function() {
		win.close();
	});
	win.add(backBtn);
	
}

var showEntries = function(view){
	var Cloud = require('ti.cloud');
	Cloud.debug = true;
	
	Cloud.Users.showMe(function(e){
		if (e.success) {
			var user = e.users[0];
			Ti.API.info('email '+user.email);
			var myJobs = Cloud.Objects.query({
				classname : 'jobs',
				limit : 1000,

				where : { 
					user_id : user.id
				}	
			}, function(f) {	
				if (f.success) {
					var table = Ti.UI.createTableView({
						width : Ti.UI.FILL,
						height : Ti.UI.FILL,
						layout : 'vertical'
					});
					var rows = new Array();
					for (var i = 0 ; i < f.jobs.length ; i++ ){
						var job = f.jobs[i];
						var row = Ti.UI.createTableViewRow({
							layout : 'horizontal',
							width : Ti.UI.FILL,
							height : Ti.UI.SIZE
						});
						var delBtn = Ti.UI.createButton({
							title : 'delete',
							width : '10%'
						});
						delBtn.addEventListener('click', function(){
							Cloud.Objects.remove({
								classname : 'jobs',
								id : job.id
							}, function(g) {
								if(g.success){
									scroll.close();
									showEntries(view);	
								}	else {
									alert('Error:\n' +
           							 ((e.error && e.message) || JSON.stringify(e)));	
								}
							});
						});
						// row.add( delBtn);
						var label =  Ti.UI.createLabel({
							height : Ti.UI.SIZE,
							width : '80%',
							text: job.description +'  '+job.wage+'  '+job.time_estimate+"\n"+job.expiration+'  Claimed '+job.claimed
						});
						
						row.add(label);
						var claimBtn = Ti.UI.createButton({
							title :'mark claimed',
							width : '10%'
						});
						claimBtn.addEventListener('click', function(){
							Cloud.Objects.update({
								classname : 'jobs',
								id : job.id,
								fields:{
									claimed : true
								}
							}, function(g) {
								if(g.success){
									scroll.close();
									showEntries(view);	
								}	else {
									alert('Error:\n' +
           							 ((e.error && e.message) || JSON.stringify(e)));	
								}
							});
						});
						// row.add( claimBtn);	
						Ti.API.info(row);
						Ti.API.info(label.text);
						rows.push(row);		
					} // end of for each job loop for loop
				}else{	//	end of if success loop funcrtion(f)
					
					alert('Error:\n' +
   				 ((e.error && e.message) || JSON.stringify(e)));				
				}
				Ti.API.info(row);
				
				table.data = rows;
				view.add(table);
				Ti.API.info(rows);
				Ti.API.info(table.data);
			}); //end of function f
			
		}// end of if e success	
		 else{
			alert('Error:\n' +
           	 ((e.error && e.message) || JSON.stringify(e)));
    	}	
	}); // end of function e
}// end of show entries function 