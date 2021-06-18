/* -----------------------------------------
Canvas Extensions Toolbar
------------------------------------------

*/
// get Current course ID
var query_string = window.location.href;
var query_string_split = query_string.split("/");
window.currentCourse = query_string_split.indexOf('courses') >= 0 ? query_string_split[query_string_split.indexOf('courses') + 1] : "";

window.canvasExtension = {};
window.canvasExtension.extensionMenu = {};

window.canvasExtension.dialog;
window.canvasExtension.dialogId = "#extensionsDialog";

window.canvasExtension.allItems = [];
window.canvasExtension.allItemsAjax = [];
window.canvasExtension.gradeBookColumns = [];

 /**
 * init, create the extension menu, each button runs a function or opens a dialog
 *
 */
window.canvasExtension.initCanvasExtensionMenu = function() {
  window.canvasExtension.buildDialog();
  //remove any existing extensions menu
  $('#extensionMenu').remove();
  //extension menu html
  var menuHTML = " \
    <div id='extensionMenu' class='' style='z-index: 10; background: #EEE; position: fixed; top: 0; right: 0; padding: 5px; text-align: right; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75); font-size: 0.5em; line-height: 1em; '> \
      <a title='Expand all' onClick='window.canvasExtension.expandAll()' class='btn btn-info' style='padding: 0.5em;'><i class='icon-page-down'></i></a> \
      <a title='Contract all' onClick='window.canvasExtension.contractAll()' class='btn btn-info' style='padding: 0.5em;'><i class='icon-page-up'></i></a> \
      <a title='Publish all' onClick='window.canvasExtension.publishAll()' class='btn btn-success' style='padding: 0.5em;'><i class='icon-publish'></i></a> \
      <a title='Unpublish all' onClick='window.canvasExtension.unpublishAll()' class='btn' style='padding: 0.5em;'><i class='icon-unpublish'></i></a>&nbsp;&nbsp;&nbsp;&nbsp; \
      <a title='Remove assignment dates' onClick='window.canvasExtension.runDialog(\"RemoveAssignmentDates\")' class='btn btn-danger' style='padding: 0.5em;'><i class='icon-calendar-clock'></i></a> \
      <a title='Find/remove empty items' onClick='window.canvasExtension.setupEmptyItems()' class='btn btn-danger' style='padding: 0.5em;'><i class='icon-document'></i></a> \
      <a title='Remove empty modules and assignment groups' onClick='window.canvasExtension.runDialog(\"RemoveEmptyModules\")' class='btn btn-danger' style='padding: 0.5em;'><i class='icon-module'></i></a>&nbsp;&nbsp;&nbsp;&nbsp; \
      <a title='Undelete' onClick='window.canvasExtension.undelete()' class='btn btn-warning' style='padding: 0.5em;'><i class='icon-line icon-sis-not-synced'></i></a> \
      <a title='Rubrics' onClick='window.canvasExtension.rubrics()' class='btn btn-warning' style='padding: 0.5em;'><i class='icon-rubric'></i></a>&nbsp;&nbsp;&nbsp;&nbsp; \
      <a title='Remove formatting' onClick='window.canvasExtension.removeFormatting()' class='btn btn-default' style='padding: 0.5em;'><i class='icon-clear-text-formatting'></i></a> \
      <a title='Remove tables' onClick='window.canvasExtension.removeTables()' class='btn btn-default' style='padding: 0.5em;'><i class='icon-table'></i></a> \
    </div> \
    ";
  //add extension menu to page
  window.extensionMenu = $('body').append(menuHTML);
}

 /**
 * setup the dialog window, add it to the page
 *
 */
window.canvasExtension.buildDialog = function() {
  //destroy any existing dialogs
  //if element exists, remove
  if ($(window.canvasExtension.dialog) > 0) window.canvaExtension.dialog.dialog("destroy");
  $(window.canvasExtension.dialogId).remove();
  //add  dialog
  $('body').append('<div id="' + window.canvasExtension.dialogId.substring(1) + '" title=""></div>');
  window.canvasExtension.dialog = $(window.canvasExtension.dialogId);
  var dialogHtml = "";
  window.canvasExtension.dialog.append(dialogHtml);
}

 /**
 * Open a dialog window, set the size and content of the dialog
 *
 * @param {string} modalType - The switch value for which modal to open.
 * @param {object} dialogData - A {object} that is used to pass data and properties to the modal.
 */
window.canvasExtension.runDialog = function(modalType, dialogData) {
  // default values for dialog
  var dWidth = 1000;
  var dHeight = $(window).height();
  var dPosition = "";
  var dTitle = "";
  var dialogHtml = "";

  // setup for different types of dialogs
  switch (modalType) {
    
    case "RemoveAssignmentDates":
      dialogHtml += "<p class='text-center'>Remove all of the assignment dates for this course?<br/>(Course ID: " + window.currentCourse + ")</p>"
      dialogHtml += "<p class='text-center'><a class='btn btn-danger' onClick='window.canvasExtension.removeAssignmentDates();'>Delete assignment dates</a></p>";
      dWidth = 400;
      dHeight = 300;
      dTitle = "Remove assignment dates";
      break;

    case "RemoveCalendarEvents":
      dialogHtml += "<p class='text-center'>Remove all of the calendar events for this course?<br/>(Course ID: " + window.currentCourse + ")</p>"
      dialogHtml += "<p class='text-center'><a class='btn btn-danger' onClick='window.canvasExtension.removeCalendarEvents();'>Delete calendar events</a></p>";
      dWidth = 400;
      dHeight = 300;
      dTitle = "Remove calendar events";
      break;

    case "OutcomeRemoveAssignmentDates":
      dialogHtml += "<p class='text-center'>" + dialogData["number"] + " assignments updated.</p>";
      dWidth = 400;
      dHeight = 300;
      dTitle = "Assignment dates removed";
      break;

    case "RemoveEmptyModules":
      dialogHtml += "<p class='text-center'>Delete all <strong>empty</strong> modules for this course (id: " + window.currentCourse + " )?</p>";
      dialogHtml += "<p class='text-center'><a class='btn btn-danger' onClick='window.canvasExtension.confirmRemoveEmptyModules();'>Yes, find empty modules</a></p>";
      dialogHtml += "<p class='text-center'>Delete all <strong>empty</strong> assignment groups for this course (id: " + window.currentCourse + " )?</p>";      
      dialogHtml += "<p class='text-center'><a class='btn btn-danger' onClick='window.canvasExtension.confirmRemoveEmptyAssignmentGroups();'>Yes, find empty assignment groups</a></p>";
      dWidth = 450;
      dHeight = 350;
      dTitle = "Remove empty modules and assignment groups";
      break;

    case "ConfirmRemoveEmptyModule":
      if (dialogData["modules"].length > 0) {
        dialogHtml += "<p class='text-center'>The following modules are empty:</p>";
        dialogHtml += "<ul>";
        $.each(dialogData["modules"], function(i, mItem) {
          dialogHtml += "<li>" + mItem.id + " - " + mItem.name + "</li>";
        });
        dialogHtml += "</ul>";
        dialogHtml += "<p class='text-center'><a class='btn btn-danger' onClick='window.canvasExtension.removeEmptyModules();'>Remove these modules</a></p>";
      } else {
        dialogHtml += "<p>There are no empty modules to remove.</p>";
      }
      dWidth = 400;
      dHeight = 500;
      dTitle = "Remove empty modules";
      break;

    case "ConfirmRemoveEmptyAssignmentGroups":
      if (dialogData["assignment_groups"].length > 0) {
        dialogHtml += "<p class='text-center'>The following assignment groups are empty:</p>";
        dialogHtml += "<ul>";
        $.each(dialogData["assignment_groups"], function(i, gItem) {
          dialogHtml += "<li>" + gItem.id + " - " + gItem.name + "</li>";
        });
        dialogHtml += "</ul>";
        dialogHtml += "<p class='text-center'><a class='btn btn-danger' onClick='window.canvasExtension.removeEmptyAssignmentGroups();'>Remove these assignment groups</a></p>";
      } else {
        dialogHtml += "<p>There are no empty assignment groups to remove.</p>";
      }
      dWidth = 400;
      dHeight = 500;
      dTitle = "Remove empty assignment groups";
      break;

    case "OutcomeRemoveEmptyModules":
      dialogHtml += "<p class='text-center'>" + dialogData["number"] + " empty modules have been removed.</p>";
      dialogHtml += "<p class='text-center'>Please refresh the modules page to see the updates.</p>";
      dialogHtml += "<p class='text-center'><a class='btn btn-warning' onClick='window.location.reload();'>Refresh page</a></p>";
      dialogHtml += "<p class='text-center'><a class='btn btn-info' href='/courses/" + window.currentCourse + "/undelete'>Undelete items</a></p>";
      dWidth = 400;
      dHeight = 450;
      dTitle += "Empty modules removed";
      break;

    case "OutcomeRemoveEmptyAssignmentGroups":
      dialogHtml += "<p class='text-center'>" + dialogData["number"] + " empty assignment groups have been removed.</p>";
      dialogHtml += "<p class='text-center'>Please refresh the assignments page to see the updates.</p>";
      dialogHtml += "<p class='text-center'><a class='btn btn-warning' onClick='window.location.reload();'>Refresh page</a></p>";
      dialogHtml += "<p class='text-center'><a class='btn btn-info' href='/courses/" + window.currentCourse + "/undelete'>Undelete items</a></p>";
      dWidth = 400;
      dHeight = 450;
      dTitle += "Empty assignment groups removed";
      break;

    case "EmptyItems":
      dialogHtml += "<p><em>Note: You will have to refresh the Modules page after any removals to see updates.</em></p>";
      dialogHtml += "<p>The following pages are empty (may take a while to load):</p>";
      dialogHtml += "<table id='emptyPageList' class='table'><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Link</th><th>Delete?</th></tr></thead><tbody></tbody></table>";
      dialogHtml += "<div class='loading text-center'><img src='/images/ajax-reload-animated.gif'> Loading.</div>";
      dialogHtml += "<p class='text-center'><a class='btn btn-warning' onClick='window.location.reload();'>Refresh page</a></p>";
      dialogHtml += "<p class='text-center'><a class='btn btn-info' href='/courses/" + window.currentCourse + "/undelete'>Undelete items</a></p>";
      dWidth = 1000;
      dTitle = "Remove empty pages/dicussions/assignments/quizzes";
      break;

    case "AddGroups":
      if (dialogData["groupCategories"].length > 0) {
        dialogHtml += "<p>Add group names on separate lines.</p>";
        dialogHtml += "<p><strong>Group set</strong>: <select>";
        $.each(dialogData["groupCategories"], function(i, gItem) {
          dialogHtml += "<option value='" + gItem.id + "'>" + gItem.name + "</option>";
        });
        dialogHtml += "</select></p>";
        dialogHtml += "<p class='text-center'><textarea style='width: 90%; height: 100px;'></textarea></p>";
        dialogHtml += "<p class='text-center'><a class='btn btn-warning' onClick='window.canvasExtension.addGroups($(window.canvasExtension.dialogId+\" select option:selected\").val());'>Add groups</a></p>";
      } else {
        dialogHtml += "<p>There are no Group Categories. Please add a group category from the People tab.</p>";
      }
      dWidth = 500;
      dHeight = 500;
      dTitle = "Add groups";
      break;

    case "OutcomeAddGroups":
      if (dialogData["groupNames"].length > 0) {
        dialogHtml += "<p class='text-center'>" + dialogData["groupNames"].length + " groups added.</p>";
        dialogHtml += "<p>" + dialogData["groupNames"].join(", ") + "</p>";
      } else {
        dialogHtml += "<p>No groups added.</p>"
      }
      dWidth = 400;
      dHeight = 300;
      dTitle = "Added groups";
      break;

    case "ManageGradeBookColumns":
      dialogHtml += "<table id='emptyPageList' class='table'><thead><tr><th>title</th><th>hidden</th><th>teacher_notes</th><th>update?</th><th>Delete?</th></tr></thead><tbody>";
      if(window.canvasExtension.gradeBookColumns.length > 0){
        $.each(window.canvasExtension.gradeBookColumns, function(i, gItem){
          console.log(gItem);
          dialogHtml += "<tr>";
          dialogHtml += "<td><input class='gradebookcolumn_title' type='text' value='"+gItem.title+"'></input></td>";
          dialogHtml += (gItem.hidden) ? "<td><input type='checkbox' class='gradebookcolumn_hidden' checked='checked'></input></td>" : "<td><input type='checkbox' class='gradebookcolumn_hidden'></input></td>";
          dialogHtml += (gItem.teacher_notes) ? "<td><input type='checkbox' class='gradebookcolumn_teacher_notes' checked='checked'></input></td>" : "<td><input type='checkbox' class='gradebookcolumn_teacher_notes'></input></td>";
          dialogHtml += "<td><a class='btn btn-success' onClick='window.canvasExtension.updateGradeBookColumn($(this), "+gItem.id+")'><i class='icon-refresh'> </i></a></td>";
          dialogHtml += "<td><a class='btn btn-danger' onClick='window.canvasExtension.confirmDeleteGradeBookColumn($(this), "+gItem.id+");'><i class='icon-trash'> </i></a></td>";
          dialogHtml += "</tr>";
        });
      }else{
        dialogHtml += "<tr><td colspan='5'><p class='text-center'>There are no custom gradebook columns in this unit.</p></td></tr>";
      }
      dialogHtml += "</tbody></table>";
      dialogHtml += "<hr/>";
      dialogHtml += "<div id='addNewGradeBookColumn'>";
        dialogHtml += "<p><strong>Add new gradebook column</strong></p>";
        dialogHtml += "<p><strong>Title:</strong> <input class='gradebookcolumn_title' type='text'></input>";
        dialogHtml += "&nbsp;&nbsp;&nbsp;&nbsp;<input type='checkbox' class='gradebookcolumn_hidden'></input> <strong>Hidden?</strong> ";
        dialogHtml += "&nbsp;&nbsp;&nbsp;&nbsp;<input type='checkbox' class='gradebookcolumn_teacher_notes' checked='checked'><strong>Teacher notes?</strong> ";
        dialogHtml += "&nbsp;&nbsp;&nbsp;&nbsp;<a class='btn btn-warning' onClick='window.canvasExtension.addGradeBookColumn();'>Add column</a></p>";
      dialogHtml += "</div>"
      dWidth = 800;
      dTitle = "Manage gradebook columns";      
      break;


    case "Message":
      dialogHtml += dialogData["message"];
      dWidth = 400;
      dHeight = 300;
      dTitle = dialogData["title"];
      break;

    default:
      //nothing
  }

  //set dialog properties, and open the dialog window
  window.canvasExtension.dialog.html("");
  window.canvasExtension.dialog.append(dialogHtml);
  // have to set the title in a few ways, the title doesn't change after the first time it runs
  window.canvasExtension.dialog.attr("title", dTitle);
  $('.ui-dialog-title', window.canvasExtension.dialog).html(dTitle);
  window.canvasExtension.dialog.dialog({
    "title": dTitle,
    buttons: [{ text: "Close", click: function() { $(this).dialog("close"); } }]
  });
  window.canvasExtension.dialog.dialog("option", "width", dWidth);
  window.canvasExtension.dialog.dialog("option", "height", dHeight);
  window.canvasExtension.dialog.dialog("option", "position", dPosition);
}

// Contract all modules/assignments
window.canvasExtension.contractAll = function() {
  $('.ig-header-title.collapse_module_link:visible, .element_toggler[aria-expanded="true"]:visible').click();
  $('.item-group-container .item-group-condensed, .ig-header').attr('style', 'padding: 0;').addClass('contractedExpanderGroups');
  $('.item-group-container .ig-header button').attr('style', 'padding: 0 5px').addClass('contractedExpanderGroups');
  //$('.ig-header-title, .expand_module_link').attr('style', 'margin: 0;');
}

// Expand all modules/assignments
window.canvasExtension.expandAll = function() {
  $('.ig-header-title.expand_module_link:visible, .element_toggler[aria-expanded="false"]:visible').click();
  $('.contractedExpanderGroups').attr('style', '').removeClass('contractedExpanderGroups');
}

// publish all items on page
window.canvasExtension.publishAll = function() {
  //publish pages
  $('#context_modules_sortable_container .context_module_item .ig-admin span[role="button"] > i').each(function() {
    if ($(this).hasClass("icon-unpublish")) {
      $(this).parent().trigger("click");
    }
  });
  //publish modules
  $('#context_modules_sortable_container div.ig-header > .ig-header-admin span[role="button"] > i').each(function() {
    if ($(this).hasClass("icon-unpublish")) {
      $(this).parent().trigger("click");
    }
  });
}

// Unpublish all items on page
window.canvasExtension.unpublishAll = function() {
  //unpublish pages
  $('#context_modules_sortable_container .context_module_item .ig-admin span[role="button"] > i').each(function() {
    if ($(this).hasClass("icon-publish")) {
      $(this).parent().trigger("click");
    }
  });
  //unpublish modules
  $('#context_modules_sortable_container div.ig-header > .ig-header-admin span[role="button"] > i').each(function() {
    if ($(this).hasClass("icon-publish")) {
      $(this).parent().trigger("click");
    }
  });
}

// Set up page dialog
window.canvasExtension.setupEmptyItems = function() {
  window.canvasExtension.runDialog("EmptyItems");
  window.canvasExtension.getEmptyItems();
}

// list all coueses in an account
window.canvasExtension.getEmptyItems = function() {
  //reset variables
  window.canvasExtension.allItems = [];
  window.canvasExtension.allItemsAjax = [];
  // LIST ALL ITEMS
  window.canvasExtension.listItemsFromCourse(
    ["Page", "Assignment", "Discussion", "Quiz"], // types of search
    { "Page": 1, "Assignment": 1, "Discussion": 1, "Quiz": 1 }, // type paging counters
    { "Page": false, "Assignment": false, "Discussion": false, "Quiz": false }, // type done yet?
    window.canvasExtension.allItems, // results array for all items
    window.canvasExtension.allItemsAjax, // array for all ajax objs
    window.canvasExtension.resultsEmptyItems // callback
  );
}

window.canvasExtension.resultsEmptyItems = function() {
  $(window.canvasExtension.dialogId + " .loading").remove();
  $.each(window.canvasExtension.allItems, function(i, item) {
    switch (item.type) {
      case "Page":
        if (!item.body) {
          $(window.canvasExtension.dialogId + " #emptyPageList tbody").append("<tr><td>" + item.page_id + "</td><td>" + item.type + "</td><td>" + item.title + "</td><td><a href='" + item.html_url + "' target='_blank' class='button'><i class='icon-link'> </i></a></td><td><a class='btn btn-danger' onClick='window.canvasExtension.confirmDeleteItem($(this), \"" + item.type + "\",\"" + item.url + "\")'><i class='icon-trash'> </i></a></td></p>");
        }
        break;
      case "Assignment":
        if (!item.description) {
          $(window.canvasExtension.dialogId + " #emptyPageList tbody").append("<tr><td>" + item.id + "</td><td>" + item.type + "</td><td>" + item.name + "</td><td><a href='" + item.html_url + "' target='_blank' class='button'><i class='icon-link'> </i></a></td><td><a class='btn btn-danger' onClick='window.canvasExtension.confirmDeleteItem($(this), \"" + item.type + "\",\"" + item.id + "\")'><i class='icon-trash'> </i></a></td></p>");
        }
        break;
      case "Discussion":
        if (!item.message) {
          $(window.canvasExtension.dialogId + " #emptyPageList tbody").append("<tr><td>" + item.id + "</td><td>" + item.type + "</td><td>" + item.title + "</td><td><a href='" + item.html_url + "' target='_blank' class='button'><i class='icon-link'> </i></a></td><td><a class='btn btn-danger' onClick='window.canvasExtension.confirmDeleteItem($(this), \"" + item.type + "\",\"" + item.id + "\")'><i class='icon-trash'> </i></a></td></p>");
        }
        break;
      case "Quiz":
        if (!item.description && item.question_count <= 0) {
          $(window.canvasExtension.dialogId + " #emptyPageList tbody").append("<tr><td>" + item.id + "</td><td>" + item.type + "</td><td>" + item.title + "</td><td><a href='" + item.html_url + "' target='_blank' class='button'><i class='icon-link'> </i></a></td><td><a class='btn btn-danger' onClick='window.canvasExtension.confirmDeleteItem($(this), \"" + item.type + "\",\"" + item.id + "\")'><i class='icon-trash'> </i></a></td></p>");
        }
        break;
      default:
    }
  });
}

 /**
 * Confirm the deletion of an item:
 *   Change the button that was pressed into a confirmation button, that when 
 *   pressed, will trigger a function to remove the item.
 *
 * @param {$element} element - The jQuery element that triggered the call
 * @param {string} type - The Canvas 'type' of the item, i.e. Page, Assignment, Discussion, Quiz
 * @param {string} id - The id of the Canvas item
 */
window.canvasExtension.confirmDeleteItem = function(element, type, id) {
  // set up the confirmation button
  var confirmElement = "<a class='btn btn-danger' onClick='window.canvasExtension.removeItem(\"" + type + "\",\"" + id + "\");$(this).closest(\"tr\").remove();'>Are you sure?</a>";
  // replace the @param element with the confirmation button
  $(element).replaceWith(confirmElement);
}

 /**
 * Remove an item from the current course
 *
 * @param {string} type - The Canvas 'type' of the item, i.e. Page, Assignment, Discussion, Quiz
 * @param {string} id - The id of the Canvas item
 */
window.canvasExtension.removeItem = function(type, id) {
  var removeURL = "";
  // generate the ajax URL that'll remove the item
  switch (type) {
    case "Page":
      removeURL = "/api/v1/courses/" + window.currentCourse + "/pages/" + id
      break;
    case "Assignment":
      removeURL = "/api/v1/courses/" + window.currentCourse + "/assignments/" + id
      break;
    case "Discussion":
      removeURL = "/api/v1/courses/" + window.currentCourse + "/discussion_topics/" + id
      break;
    case "Quiz":
      removeURL = "/api/v1/courses/" + window.currentCourse + "/quizzes/" + id
      break;
    default:
      //ignore
  }
  // remove the item
  $.ajax({
    type: "DELETE",
    url: removeURL,
    dataType: "json",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    success: function(data, textStatus, xhr) {
      console.log(textStatus, xhr.status, data);
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  });
}

 /**
 * Set up the Add Groups dialog:
 *   Get the current set of group categories, and pass them to the AddGroups dialog
 *   to use.
 *
 */
window.canvasExtension.setupAddGroups = function() {
  $.getJSON("/api/v1/courses/" + window.currentCourse + "/group_categories", function(groupCategoryData) {
    var groupCategories = [];
    $.each(groupCategoryData, function(i, groupCategory) {
      groupCategories.push({
        "id": groupCategory.id,
        "name": groupCategory.name
      });
    });
    window.canvasExtension.runDialog("AddGroups", { "groupCategories": groupCategories });
  });
}

 /**
 * Add the groups from the text entred, to the course
 *
 * @param {string} groupCategory - The id of the group category to add the groups to.
 */
window.canvasExtension.addGroups = function(groupCategory) {
  var groupNames = [];
  // read the text area, split each new line into a string for a new group name
  $.each($(window.canvasExtension.dialogId + ' textarea').attr('value').split("\n"), function() {
    var groupId = this.trim();
    if (groupId != "") groupNames.push(groupId);
  });
  // create the groups under the @groupCategory
  $.each(groupNames, function(g, groupName) {
    $.ajax({
      type: "POST",
      url: "/api/v1/group_categories/" + groupCategory + "/groups",
      dataType: "json",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: '{"name":"' + groupName + '"}',
      success: function(data, textStatus, xhr) {
        console.log(textStatus, xhr.status, data);
      },
      error: function(xhr, textStatus, errorThrown) {
        console.log("error: " + errorThrown);
      }
    });
  });
  // run the outcome dialog, returning the list of group names
  window.canvasExtension.runDialog("OutcomeAddGroups", { "groupNames": groupNames });
}

 /**
 * Confirm the removal of all of the empty modules:
 *   Generate a list of empty modules, and send them to the confirmation dialog.
 *
 */
window.canvasExtension.confirmRemoveEmptyModules = function() {
  // note: that Canvas is restricted to only get 100 modules per page, if there are more, then you'll have to build in paging.
  // search for modules in the current course, check to see if they are empty
  $.getJSON("/api/v1/courses/" + window.currentCourse + "/modules?include=items&per_page=100", function(moduleData) {
    var modulesForRemoval = [];
    $.each(moduleData, function(i, mItem) {
      if (mItem.items.length > 0) {
        // ignore - not empty
      } else {
        modulesForRemoval.push(mItem);
      }
    });
    // run the confirmation dialog
    window.canvasExtension.runDialog("ConfirmRemoveEmptyModule", { "modules": modulesForRemoval });
  });
}

 /**
 * Confirm the removal of all of the empty assignment groups:
 *   Generate a list of empty assignment groups, and send them to the confirmation dialog.
 *
 */
window.canvasExtension.confirmRemoveEmptyAssignmentGroups = function() {
  // search for assignment_groups in the current course, check to see if they are empty
  $.getJSON("/api/v1/courses/" + window.currentCourse + "/assignment_groups?include=assignments&per_page=100", function(groupData) {
    console.log(groupData);
    var assignmentGroupsForRemoval = [];
    $.each(groupData, function(i, gItem) {
      if (gItem.assignments.length > 0) {
        // ignore - not empty
      } else {
        assignmentGroupsForRemoval.push(gItem);
      }
    });
    // run the confirmation dialog
    window.canvasExtension.runDialog("ConfirmRemoveEmptyAssignmentGroups", { "assignment_groups": assignmentGroupsForRemoval });
  });
}

 /**
 * Remove the empty modules from the course
 *
 */
window.canvasExtension.removeEmptyModules = function() {
  // note: that Canvas is restricted to only get 100 modules per page, if there are more, then you'll have to build in paging.
  // search all of the modules of the current course
  $.getJSON("/api/v1/courses/" + window.currentCourse + "/modules?include=items&per_page=100", function(moduleData) {
    var mCount = 0;
    $.each(moduleData, function(i, mItem) {
      if (mItem.items.length > 0) {
        // ignore - not empty
      } else {
        mCount++;
        // delete the empty module
        $.ajax({
          type: "DELETE",
          url: "/api/v1/courses/" + window.currentCourse + "/modules/" + mItem.id,
          dataType: "json",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          success: function(data, textStatus, xhr) {
            console.log(textStatus, xhr.status, data);
          },
          error: function(xhr, textStatus, errorThrown) {
            console.log("error: " + errorThrown);
          }
        });
      }
    });
    // show the outcome dialog, with a count of the number of modules removed.
    window.canvasExtension.runDialog("OutcomeRemoveEmptyModules", { "number": mCount });
  });
}

 /**
 * Remove the empty assignment groups from the course
 *
 */
window.canvasExtension.removeEmptyAssignmentGroups = function() {
  // note: that Canvas is restricted to only get 100 modules per page, if there are more, then you'll have to build in paging.
  // search all of the modules of the current course
  $.getJSON("/api/v1/courses/" + window.currentCourse + "/assignment_groups?include=assignments&per_page=100", function(assignmentGroupData) {
    var gCount = 0;
    $.each(assignmentGroupData, function(i, gItem) {
      if (gItem.assignments.length > 0) {
        // ignore - not empty
      } else {
        gCount++;
        // delete the empty module
        $.ajax({
          type: "DELETE",
          url: "/api/v1/courses/" + window.currentCourse + "/assignment_groups/" + gItem.id,
          dataType: "json",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          success: function(data, textStatus, xhr) {
            console.log(textStatus, xhr.status, data);
          },
          error: function(xhr, textStatus, errorThrown) {
            console.log("error: " + errorThrown);
          }
        });
      }
    });
    // show the outcome dialog, with a count of the number of modules removed.
    window.canvasExtension.runDialog("OutcomeRemoveEmptyAssignmentGroups", { "number": gCount });
  });
}

 /**
 * Remove dates from Assignment pages
 *
 */
window.canvasExtension.removeAssignmentDates = function() {
  // get all of the assignments in the courses
  $.ajax({
    type: "get",
    url: "/api/v1/courses/" + window.currentCourse + "/assignments?per_page=100",
    crossDomain: true,
    cache: false,
    dataType: "json",
    contentType: "application/json; charset=UTF-8",
    success: function(data, textStatus, xhr) {
      for (var i = 0; i < data.length; i++) {
        // remove the due date, and start/end dates for each assignment
        $.ajax({
          type: "PUT",
          url: "/api/v1/courses/" + window.currentCourse + "/assignments/" + data[i].id,
          dataType: "json",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: '{"assignment":{"due_at":"","lock_at":"","unlock_at":""}}',
          success: function(data, textStatus, xhr) {
            console.log(textStatus, xhr.status, data);
          },
          error: function(xhr, textStatus, errorThrown) {
            console.log("error: " + errorThrown);
          }
        });
      }
      // show the outcome dialog, send then number of assignments that were updated
      window.canvasExtension.runDialog("OutcomeRemoveAssignmentDates", { "number": data.length });
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  });
}

 /**
 * LIST ALL ITEMS FROM COURSE BY TYPE
 * 
 * 
 * @param {array} itemTypes - set of item types, i.e. ["Page", "Assignment", "Discussion", "Quiz"]
 * @param {object} itemTypesPageCount - object with page counter matching types
 * @param {object} resultsByType - object with resutls by type
 * @param {global array} itemResults - array for item results
 * @param {global array} itemsResultsAjax - array for ajax calls
 * @param {requestCallback} callback - callback function, this runs after all of the items have been retrieved
 */
window.canvasExtension.listItemsFromCourse = function(itemTypes, itemTypesPageCount, resultsByType, itemResults, itemsResultsAjax, callback) {
  $.each(itemTypes, function(i, itemType) {
    var itemType = itemType;
    var itemTypeURL = "";
    var itemURL = "";
    var itemIdOn = "";

    // get URLs for item calls. Canvas is limited to 100 items per 'page', so listItemsFromCourse may be called multiple times
    switch (itemType) {
      case "Page":
        itemTypeURL = "/api/v1/courses/" + window.currentCourse + "/pages?sort=title&page=" + itemTypesPageCount[itemType] + "&per_page=100"
        itemURL = "/api/v1/courses/" + window.currentCourse + "/pages/"
        itemIdOn = 'url'
        break;
      case "Assignment":
        itemTypeURL = "/api/v1/courses/" + window.currentCourse + "/assignments?page=" + itemTypesPageCount[itemType] + "&per_page=100"
        itemURL = "/api/v1/courses/" + window.currentCourse + "/assignments/"
        itemIdOn = 'id'
        break;
      case "Discussion":
        itemTypeURL = "/api/v1/courses/" + window.currentCourse + "/discussion_topics?page=" + itemTypesPageCount[itemType] + "&per_page=100"
        itemURL = "/api/v1/courses/" + window.currentCourse + "/discussion_topics/"
        itemIdOn = 'id'
        break;
      case "Quiz":
        itemTypeURL = "/api/v1/courses/" + window.currentCourse + "/quizzes?page=" + itemTypesPageCount[itemType] + "&per_page=100"
        itemURL = "/api/v1/courses/" + window.currentCourse + "/quizzes/"
        itemIdOn = 'id'
        break;
      default:
    }

    itemsResultsAjax.push(
      $.ajax({
        type: "GET",
        url: itemTypeURL,
        success: function(data, textStatus, xhr) {
          $.each(data, function(t, tItem) {
            itemsResultsAjax.push($.ajax({
              type: "GET",
              url: itemURL + tItem[itemIdOn],
              success: function(data) {
                data.type = itemType;
                // add item to results
                itemResults.push(data);
              }
            }));
          });
          // will throw out of loop if number of courses > 10000 -- if you have more than 10000 units, increase the pNum check
          if (xhr.getResponseHeader('Link').indexOf('rel="next"') > 0 && itemTypesPageCount[itemType] < 100) {
            itemTypesPageCount[itemType]++;
            // get next page
            // keep getting items, get next set for this item type
            window.canvasExtension.listItemsFromCourse([itemType], itemTypesPageCount, resultsByType, itemResults, itemsResultsAjax, callback);
          } else {
            resultsByType[itemType] = true;
            //check all items for all item types are done
            var allTrue = true;
            $.each(resultsByType, function(n, nDone) {
              if (!nDone) allTrue = false;
            });
            // if they're all done, do results
            if (allTrue) {
              // when all the ajax is done, run the callback
              $.when.apply(undefined, itemsResultsAjax).then(callback);
            }
          }
        },
        error: function(xhr, textStatus, errorThrown) {
          console.log("error: " + errorThrown);
        }
      })
    );
  });
}

/**
 * setupGradeBookColumns
 */
window.canvasExtension.setupGradeBookColumns = function(){
  window.canvasExtension.listGradeBookColumns(function(data){
    window.canvasExtension.gradeBookColumns = data;
    window.canvasExtension.runDialog("ManageGradeBookColumns");
  });
}

/**
 * LIST - GET /api/v1/courses/:course_id/custom_gradebook_columns
 * @param {function} callback
 */
window.canvasExtension.listGradeBookColumns = function(callback){
  $.getJSON("/api/v1/courses/"+window.currentCourse+"/custom_gradebook_columns?include_hidden=true", function(data) {
    callback(data);
    //window.canvasExtension.newGradeBookColumn("New column", gradeBookColumns.length+1, false, true)
  });
}

 /**
 * Confirm the deletion of an item:
 *   Change the button that was pressed into a confirmation button, that when 
 *   pressed, will trigger a function to remove the item.
 *
 * @param {$element} element - The jQuery element that triggered the call
 * @param {string} id - The id of the gradebook column
 */
window.canvasExtension.confirmDeleteGradeBookColumn = function(element, id){
  // set up the confirmation button
  var confirmElement = "<a class='btn btn-danger' onClick='window.canvasExtension.deleteGradeBookColumn(\"" + id + "\");$(this).closest(\"tr\").remove();'>Are you sure?</a>";
  // replace the @param element with the confirmation button
  $(element).replaceWith(confirmElement);
}

/**
 * LIST - GET /api/v1/courses/:course_id/custom_gradebook_columns
 * @param {function} callback
 */
window.canvasExtension.deleteGradeBookColumn = function(id){
  // remove the gradebook column
  $.ajax({
    type: "DELETE",
    url: "/api/v1/courses/"+window.currentCourse+"/custom_gradebook_columns/"+id,
    dataType: "json",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    success: function(data, textStatus, xhr) {
      console.log(textStatus, xhr.status, data);
      window.canvasExtension.setupGradeBookColumns();
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  });
}

/**
 * UPDATE - PUT /api/v1/courses/:course_id/custom_gradebook_columns/:id
 * @param {$element} update button that called function
 * @param {string} id of gradebook column
 */
window.canvasExtension.updateGradeBookColumn = function(element, id){
  var column_title = $(element).closest('tr').find('.gradebookcolumn_title').attr('value');
  var column_hidden = ($(element).closest('tr').find('.gradebookcolumn_hidden').attr('checked')) ? true : false;
  var column_teacher_notes = ($(element).closest('tr').find('.gradebookcolumn_teacher_notes').attr('checked')) ? true : false;
  console.log("column_title", column_title, "column_hidden", column_hidden, "column_teacher_notes", column_teacher_notes);
  $.ajax({
    type: "PUT",
    url: "/api/v1/courses/" + window.currentCourse + "/custom_gradebook_columns/" + id,
    dataType: "json",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: '{"column": {"title": "'+column_title+'", "hidden": "'+column_hidden+'", "teacher_notes": "'+column_teacher_notes+'"}}',
    success: function(data, textStatus, xhr) {
      console.log(textStatus, xhr.status, data);
      window.canvasExtension.setupGradeBookColumns();      
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  });
}


/**
 * Add gradebook column
 */
window.canvasExtension.addGradeBookColumn = function(){
  var column_title = $(window.canvasExtension.dialogId + " #addNewGradeBookColumn .gradebookcolumn_title").attr('value');
  var column_position = window.canvasExtension.gradeBookColumns.length+1;
  var column_hidden = ($(window.canvasExtension.dialogId + " #addNewGradeBookColumn .gradebookcolumn_hidden").attr('checked')) ? true : false;
  var column_teacher_notes = ($(window.canvasExtension.dialogId + " #addNewGradeBookColumn .gradebookcolumn_teacher_notes").attr('checked')) ? true : false;
  window.canvasExtension.createGradeBookColumn(column_title, column_position, column_hidden, column_teacher_notes, window.canvasExtension.setupGradeBookColumns);
}


/**
 * NEW COLUMN - POST /api/v1/courses/:course_id/custom_gradebook_columns
 * @param {Required string} column_title - no description
 * @param {integer} column_position - The position of the column relative to other custom columns
 * @param {boolean} column_hidden  - Hidden columns are not displayed in the gradebook
 * @param {boolean} column_teacher_notes - Set this if the column is created by a teacher. The gradebook only supports one teacher_notes column.
 * @param {function} callback
 */
window.canvasExtension.createGradeBookColumn = function(column_title, column_position, column_hidden, column_teacher_notes, callback){
  $.ajax({
    type: "POST",
    url: "/api/v1/courses/"+window.currentCourse+"/custom_gradebook_columns",
    dataType: "json",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: '{"column":{"title": "'+column_title+'", "position": '+column_position+', "hidden": '+column_hidden+',"teacher_notes": '+column_teacher_notes+'}}',
    success: function(data, textStatus, xhr) {
      console.log(textStatus, xhr.status, data);
      callback();
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  });
}

// Navigates to the undelete page for the current course.
window.canvasExtension.undelete = function() {
  window.location.href = '/courses/' + window.currentCourse + '/undelete';
}

// Navigates to the rubrics page for the current course.
window.canvasExtension.rubrics = function() {
  window.location.href = '/courses/' + window.currentCourse + '/rubrics';
}

/**
  * Removes all leading, trailing and extra white spaces and paragraphs 
  * from the Rich Text Editor currently on the screen, as well as the title.
  * Also removes unwanted HTML tags and inline CSS.
  * Notes: Must be in Edit mode to work. Will not remove spaces in between
  * letters in a word.
  */
window.canvasExtension.removeFormatting = function() {
    $(document).ready(function() {
    const pageType = window.location.pathname;

    const fixEditorContent = () => {
        const editor = tinymce.activeEditor;
        let content = editor.getContent();
        content = content.replace(/<p>&nbsp;<\/p>/g, '').replace(/&nbsp;/g, ' ').replace(/&emsp;/g, '').replace(/&ensp;/g, '').replace(/&bull;/g, '')
        .replace(/\( +/g, '(').replace(/ +\)/g, ')').replace(/ +\./g, '.').replace(/ +\,/g, ',').replace(/ +\!/g, '!')
        .replace(/ +\?/g, '?').replace(/ +\:/g, ':').trim()
        //these replace calls remove unwanted HTML tags
        .replace(/<\/?span[^>]*>/g, '').replace(/<\/?div[^>]*>/g, '').replace(/<\/?em[^>]*>/g, '').replace(/<\/?strong[^>]*>/g, '')
        .replace(/<\/?hr[^>]*>/g, '').replace(/<\/?pre[^>]*>/g, '').replace(/<\/?br[^>]*>/g, '<p>').replace(/<\/?hr[^>]*>/g, '')
        //finally, this call removes all inline CSS styles from all HTML tags
        .replace(/style=\"(.*?)\"/g, '');
        editor.setContent(content);
    }

    const fixPageTitle = () => {
        let pageTitle = $('#title').val().replace(/\s+/g, ' ').replace( / +\:/g, ':' ).replace( / +\,/g, ',' ).trim();
        $('#title').val(pageTitle);
    }
    
    const fixAssignmentTitle = () => {
        let assignmentName = $('#assignment_name').val().replace(/\s+/g, ' ').replace(/ +\:/g, ':').replace(/ +\,/g, ',').trim();
        $('#assignment_name').val(assignmentName);
    }

    const fixQuizTitle = () => {
        let quizTitle = $('#quiz_title').val().replace(/\s+/g, ' ').replace(/ +\:/g, ':').replace(/ +\,/g, ',').trim();
        $('#quiz_title').val(quizTitle);
    }

    const fixDiscussionTitle = () => {
        let discussionTitle = $('#discussion-title').val().replace(/\s+/g, ' ').replace(/ +\:/g, ':')
        .replace( /\( +/g, '(' ).replace( / +\)/g, ')' ).replace(/ +\./g, '.').replace(/ +\,/g, ',').trim();
        $('#discussion-title').val(discussionTitle);
    }
     
      if(pageType.indexOf("pages") >= 0) {
       fixPageTitle();
     } else if(pageType.indexOf("assignments") >= 0) {
       fixAssignmentTitle();
     } else if(pageType.indexOf("quizzes") >= 0) {
       fixQuizTitle();
     } else if(pageType.indexOf("discussion_topics") >= 0) {
       fixDiscussionTitle();
     }
       fixEditorContent();
     });
}

// Removes all <table> tags from the Rich Content Editor on the current page
window.canvasExtension.removeTables = function() {
  $(document).ready(function() {
  const editor = tinymce.activeEditor;
  let content = editor.getContent();
  
  content = content.replace(/<\/?table[^>]*>/g,'');
  
  editor.setContent(content);
  });
}

//------------------ WIP::COURSES -----------------

window.canvasExtension.allCourses = [];

// list all courses in an account
window.canvasExtension.listAllCourses = function() {
  window.canvasExtension.allCourses = [];
  var nextPage = 1;
  window.canvasExtension.listNextCourses(nextPage);
}

window.canvasExtension.listNextCourses = function(pNum) {
  $.ajax({
    type: "GET",
    url: "/api/v1/accounts/1/courses?page=" + pNum + "&per_page=100",
    dataType: "json",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    success: function(data, textStatus, xhr) {
      //console.log(xhr.getResponseHeader('Link'));
      $.each(data, function(i, tCourse) {
        window.canvasExtension.allCourses.push({
          "name": tCourse.name,
          "id": tCourse.id
        });
        //$(window.canvasExtension.dialogId+" #courseList tbody").append('<tr><td>'+tCourse.id+'</td><td>'+tCourse.name+'</td></tr>');
      });
      //will throw out of loop if number of courses > 10000 -- if you have more than 10000 units, increase the pNum check
      if (xhr.getResponseHeader('Link').indexOf('rel="next"') > 0 && pNum < 100) {
        pNum++;
        window.canvasExtension.listNextCourses(pNum);
      } else {
        window.canvasExtension.addCourseResults();
      }
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  });
}

window.canvasExtension.addCourseResults = function() {
  console.log(window.canvasExtension.allCourses);
}

//---------------WIP::CALENDAR EVENTS--------------
/**
  * Remove all Calendar events
  */
window.canvasExtension.removeCalendarEvents = function() {
  //get all calendar events
  $.ajax({
    type: "GET",
    url: "/api/v1/calendar_events",
    crossDomain: true,
    cache: false,
    dataType: "json",
    contentType: "application/json; charset=UTF-8",
    success: function(data, textStatus, xhr) {
      console.log(textStatus, xhr.status, data);
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log("error: " + errorThrown);
    }
  })
}

//---- RUN THE INIT ------------------------------
window.canvasExtension.initCanvasExtensionMenu();