//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

function required(text) {
}

var validators = {
	phone: function (text) {
		var phone_re = /[0-9.\-()]{7,}/;
		return phone_re.test(text)
	},
	required: function (text) {
		return (text || "") !== "";
	},
	email: function (text) {
		// We're not going to try very hard at this, other than making sure it's not insane
		var parseResult = emailAddresses.parseOneAddress(text);
		return parseResult && parseResult.domain.indexOf(".") !== -1;
	},
	notEmail: function (text) {
		return !validators.email(text) && validators.required(text); 
	},
	confirmEmail: function(text) {
		return text === $("#msform input[name='email']").val() && validators.email(text);
	},
	tshirt: function(text) {
		return text != "invalid";
	}
}

function validateInput(element) {
	var validatorName = $(element).data("validator");
	if (!validatorName) {
		return true;
	}
	var isValid = validators[validatorName]($(element).val());

	$(element).toggleClass("error_field", !isValid);
	return isValid;
}

$("input,select").on("change", function (event) {
	validateInput(event.currentTarget);
});

function updateProgress(progressSection) {
	var progressItem = $("#" + progressSection + "-progress")
	progressItem.addClass("active");
	progressItem.prevAll().addClass("active");
	progressItem.nextAll().removeClass("active");
}

function moveToNext(current_fs) {
	moveTo(current_fs, current_fs.next());
}

function moveTo(current_fs, next_fs) {
	if(animating) return false;
	animating = true;
	updateProgress(next_fs.data("progress"));

	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'transform': 'scale('+scale+')'});
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
}

function validateAll(fieldset) {
	var ret_valid = true;
	fieldset.find("input,select").each(function (index, element) {
		var isValid = validateInput(element);
		ret_valid = ret_valid && isValid;
	});
	return ret_valid;
}

$(".next").click(function(){
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();

	var can_proceed = validateAll(current_fs);

	if(can_proceed){
		moveToNext(current_fs);
	}
});

$(".previous").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	updateProgress(previous_fs.data("progress"));
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

$("#something_else").on("change", function(event) {
	$("#other-interest").toggle($(event.currentTarget).prop("checked"));
})

$(".submit").click(function(event){
	event.preventDefault();
	var current_fs = $(this).parent();
	var can_submit = validateAll(current_fs);
	if (!can_submit) {
		return;
	}

	var json = {}
	$("#msform").find("input[type!=checkbox], textarea, select").each(function (index, element) {
		json[$(element).attr("name")] = $(element).val();
	});
	$("#msform").find("input[type=checkbox]").each(function (index, element) {
		json[$(element).attr("name")] = $(element).prop( "checked" );
	});
	delete json["undefined"]
	delete json.submit;
	console.log(json);
	$.post($("#msform").attr("action"), json).done(function(data){
		moveTo(current_fs, $("#success-page"));
	}).fail(function (response) {
		var errorPage = $("#failure-page");
		errorPage.find(".error").text(response.responseText);
		moveTo(current_fs, errorPage);
	});
	return false;
});

function computeTall() {
	console.log("hi");
	$("body").toggleClass("tall", window.innerHeight * 950/572 > window.innerWidth);
}
computeTall();
$(window).on("resize", computeTall);

$(document).ready(function() {
    $('.bool-slider .inset .control').click(function() {
        if (!$(this).parent().parent().hasClass('disabled')) {
            if ($(this).parent().parent().hasClass('true')) {
                $(this).parent().parent().addClass('false').removeClass('true');
            } else {
                $(this).parent().parent().addClass('true').removeClass('false');
            }
        }
    });
});