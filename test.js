/**
 * Created by rboinepalli on 5/18/17.
 */


/**
 * Created by rboinepalli on 5/18/17.
 */


var submitFeedback  = function (component, event, helper) {
    if(component.isValid()) {
        component.find("submitButtonRealTime").set("v.disabled",true);
        component.find("cancelButtonRealTime").set("v.disabled",true);
        var inputComponent = component.find("comments");
        var commentsProvided = inputComponent.get("v.value");
        console.log("Value of input " + commentsProvided);
        var errorMessageComponent = component.find("feedbackCreateErrorMessage");


        if($A.util.isEmpty(commentsProvided) || (commentsProvided.trim().length == 0) ) {
            //Setting error
            //inputComponent.set("v.errors", [{message:"Please provide some feedback."}]);
            if (component.get("v.feedbackType") == 'Request'){
                component.set("v.feedbackError", "Please provide a description of your feedback request.");
            } else {
                component.set("v.feedbackError", "Please provide some feedback.");
            }
            $A.util.removeClass( errorMessageComponent , "hidden");
            component.find("submitButtonRealTime").set("v.disabled",false);
            component.find("cancelButtonRealTime").set("v.disabled",false);
            console.log("Input Validation error: Null Feedback given");
        }
        else {
            //clearing error
            //inputComponent.set("v.errors", null);
            $A.util.addClass( errorMessageComponent , "hidden");
            component.set("v.feedbackError", "");
            console.log("Clearing the error");
            console.log(component.get("v.selectedUserId"));
            var action = component.get("c.createFeedback");
            var requestFeedback = component.get("v.feedbackRequest");
            var feedback;
            var isAnonymous = component.get("v.submitAnonymous");
            if(requestFeedback == null || requestFeedback == undefined){
                feedback = component.get("v.feedback");
                feedback.fbk__Feedback_To__c = component.get("v.selectedUserId");
                feedback.fbk__Type__c = component.get("v.feedbackType");
                if (feedback.fbk__Type__c == 'Request'){
                    feedback.fbk__Request_Message__c = commentsProvided.trim();
                    feedback.fbk__Requested__c = true;
                }  else {
                    feedback.fbk__Feedback__c = commentsProvided.trim();
                }
            } else { //
                feedback = component.get("v.feedbackRequest");
                feedback.fbk__Feedback_To__c = component.get("v.selectedUserId");
                feedback.fbk__Feedback__c = commentsProvided.trim();
                feedback.fbk__Type__c = component.get("v.feedbackType");
                feedback.fbk__Response_Date__c = new Date();
            }

            action.setParams({
                "feedback": JSON.parse(JSON.stringify(feedback)),
                "isAnonymous":isAnonymous
            });
            action.setAbortable();
            action.setCallback(this, function(actionResult) {
                console.log('actionResult:');
                console.log(actionResult);
                var state = actionResult.getState();

                if(component.isValid() && state === "SUCCESS") {
                    //Fire event only when submit is successful.

                    $A.get("e.c:hideBackToSearch").fire();

                    console.log('[createFeedback] state=success');
                    var returnValue = actionResult.getReturnValue();
                    console.log('Return value : ',returnValue);
                    var savedFeedback = returnValue.feedback;
                    var feedbackTo = returnValue.feedbackToName ;
                    var message = '';
                    if (savedFeedback && savedFeedback.fbk__Type__c == 'Request'){
                        message = 'You have requested feedback from ' + feedbackTo;
                    } else {
                        message = 'Your feedback for ' + feedbackTo + ' has been successfully submitted!';
                    }
                    console.log(message);
                    component.set("v.feedbackRequest",null);
                    var reqcheck = component.get("v.feedbackRequest");
                    console.log('reqcheck---'+reqcheck);
                    component.set("v.showFbCreate",false);
                    component.set("v.showFbType",false);
                    $A.get("e.c:FeedbackIdeasInit").setParams({
                        "selectedUserNameFeedbackResult" : message,
                        "showToast": true,
                        "v.feedbackRequest" : null
                    }).fire();



                }  else if (component.isValid() && state === "ERROR") {
                    console.log('[createFeedback] errors found... ');
                    var errors = actionResult.getError();
                    //print error or loop error array will be better in case theres more then one
                    if (errors) {
                        var errorsForDisplay = 'The individual you are sending feedback to may not currently be part of Frank, the feedback app. Please try again soon. If you believe this person should be on Frank, please submit a concierge ticket to assign the "Feedback User" permission set. Error Details:';
                        for(var i = 0 ; i <= errors.length ; i++){
                            if(errors[i] && errors[i].message) {
                                console.log("1st level Error message: " + errors[i].message);
                                errorsForDisplay = errorsForDisplay + " " +  errors[i].message
                            }

                            if(errors[i] && errors[i].pageErrors) {
                                //for some reason aura doesn't like the iteration code below so we pull out the first error
                                var pageErrorMsg = errors[i].pageErrors[0].message;
                                console.log("PageErrors[0] message:" + errors[i].pageErrors[0].message);
                                errorsForDisplay = errorsForDisplay + " " + pageErrorMsg + " ";

                                /*for(var j = 0; j <= errors[i].pageErrors.length ; j++){
                                 var pageErrorMsg = errors[i].pageErrors[j].message;
                                 console.log("Error message: " + pageErrorMsg + " Number of errors:" + errors[i].pageErrors.length);
                                 errorsForDisplay = errorsForDisplay + " " + pageErrorMsg + " ";

                                 } */

                            }
                            console.log('end of outer for');
                        }
                        console.log('before show errors');
                        //show errors
                        component.set("v.feedbackError", errorsForDisplay);
                        $A.util.removeClass( errorMessageComponent , "hidden");

                    } else {
                        console.log("Unknown error!");
                    }

                }

            });
            $A.enqueueAction(action);
        }
    }
    else {
        console.log('FeedbackCreateController: submitFeedback - component invalid hence entered else');
    }
}