let Form = function(){

	let formObject = $('#lp-signup-form'),
		inputs = $('.form-data-wrapper'),
		download = $('.form-download-wrapper'),
		registerBtn = $('.form-register'),
		nameField = $('.form-name'),
		emailField = $('.form-email'),
		phoneField = $('.form-phone'),
		companyField = $('.form-company'),
		campaignID = formObject.data('campaign'),
		intercomEvent = formObject.data('intercom-event'),
		settings = {},
		validationObject;

	let parseSettings = function(){
		settings.email = emailField.val();
		settings.name = nameField.val();
		settings.phone = phoneField.val();
		settings.companyName = companyField.val();
		settings.last_visit_source = getLeadSource();
	};

	let startValidation = function(){
		validationObject = formObject.validate({
			errorElement: 'em',
			errorPlacement: function(error, element) {
				return error.insertBefore(element);
			},
			rules: {
				email: {
					required: true
				},
				name: {
					required: true,
					minlength: 2
				},
				company: {
					required: true,
					minlength: 2
				}
			}
		});
	};

	let readCookie = function(name) {

	    let cookieName = `${name}=`;
	    let allCookies = document.cookie.split(';');

	    for (let i = 0; i < allCookies.length; i++) {

	        let x = allCookies[i];

	        while ( x.charAt(0) == ' ' ) { 
	        	x = x.substring( 1, x.length);
	        }

	        if ( x.indexOf(nameEQ) == 0 ) {
	        	return x.substring(cookieName.length, x.length);
	        }
	    }

	    return null;
	};

	let setFormCookie = function() {
		let d = new Date();
    	d.setTime( d.getTime() + (180 * 86400000) );
    	let expires = "expires=" + d.toUTCString();
    	document.cookie = "formFilled=true;" + expires;
	};

	let getLeadSource = function(){

		let lsCookie = readCookie("leadSource");

	    if (lsCookie !== "" && lsCookie !== null) {
	    	return lsCookie;
	    } else {

	    	let ls,
	    		params = {},
	    		search = location.search.substring(1);

	    	if ( search !== '' ) {
	    		params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
	    	}

	    	if (params.hasOwnProperty('utm_medium')) {
	    	    if (params['utm_medium'] == 'org_social') { ls = 'Organic Social'; }
	    	    else if (params['utm_medium'] == 'paid_social') { ls = 'Paid Social'; }
	    	    else if (params['utm_medium'] == 'display') { ls = 'Display'; }
	    	    else if (params['utm_medium'] == 'paid_search') { ls = 'Paid Search'; }
	    	    else { ls = params['utm_medium']; }
	    	} else if ((document.referrer.indexOf('google') + document.referrer.indexOf('bing')) > -2) {
	    	    ls = 'Organic Search';
	    	} else if (document.referrer != '') {
	    	    ls = 'Inbound Link';
	    	} else {
	    	    ls = 'Marketing Unknown';
	    	}

	    	return ls;
	    }
	};

	let register = function(){
		if( validationObject.form() ){

			formObject.StickyForm('process');
			setFormCookie();
			parseSettings();

			inputs.slideUp();
			setTimeout(function(){
				download.fadeIn();
			},800);

			Intercom('update', settings);

			if (campaignID !== 'none') {
				setTimeout(function(){
					Intercom('trackEvent', 'campaign-linker', {
						'campaignID': campaignID,
						'email' : settings.email
					});
				}, 1000);
			}

			if (intercomEvent !== 'none') {
				setTimeout(function(){
					Intercom('trackEvent', intercomEvent);
				}, 1000);
			}

			if (window.ga) {
				ga('gtm1.send', 'event', 'LP', 'Convert', intercomEvent);
			}

			if (typeof mixpanel !== 'undefined') {
				mixpanel.identify(settings.email);
				mixpanel.people.set({
				    "$email": settings.email,
				    "$first_name": settings.name,
				    "lead_source": settings.last_visit_source,
				    "phone": settings.phone,
				    "company": settings.companyName
				});
				mixpanel.track( 'Form Fillout', {
					"email" : settings.email, 
					"campaignID" : campaignID, 
       				"URL" :  window.location.pathname
       			});
			}
		}
	};

	let bindActions = function(){
		registerBtn.on('click', function(e){
			e.preventDefault();
			register();
		});

		formObject.keypress(function(e) {
		    if(e.which == 13) {
		    	registerBtn.trigger('click');
		    }
		});
	};	

	let init = function() {
		if (formObject.length) {

			startValidation();
			formObject.StickyForm();
			bindActions();

			formObject.find('input:visible:first').focus();

			let previouslyFilled = readCookie('formFilled');

			if (previouslyFilled !== "" && previouslyFilled !== null) {
				inputs.slideUp();
				setTimeout(function(){
					download.fadeIn();
				},800);
			}

			if (window.ga) {
				ga('gtm1.send', 'event', 'LP', 'Arrival', intercomEvent);
			}

			if (typeof mixpanel !== 'undefined') {
				mixpanel.track( 'Form Show');
			}
		}
	};

	return {
		init:init
	};
}();

Form.init();