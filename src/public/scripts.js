// All this to avoid a SPA...

window.initHandlers = function () {
  console.log('initHandlers')
  addFriseToggleHandler()
  addFriseHiddenContentToggleHandler()
  addDateValidationHandler()
  addActionMenuHandlers()
  addInvitationHandlers()
  addPuissanceModificationHandler()
  addDelayDateModificationHandler()
  addSelectorHandlers()
  addSendCopyOfNotificationButtonHandler()
  addPaginationHandler()
  addGoToProjectPageHandlers()
  addMotifEliminationToggleHandlers()
  addVisibilityToggleHandler()
  addProjectListSelectionHandler()
  addConfirmHandlers()
}

document.addEventListener('DOMContentLoaded', () => window.initHandlers())

//
// Action menu
//

function addActionMenuHandlers() {
  const actionMenuTriggers = document.querySelectorAll('[data-testid=action-menu-trigger]')

  const actionMenus = document.querySelectorAll('[data-testid=action-menu]')

  function hideAllMenus() {
    actionMenus.forEach((item) => item.classList.remove('open'))
  }

  actionMenuTriggers.forEach((item) =>
    item.addEventListener('click', function (event) {
      event.preventDefault()
      event.stopPropagation()

      const menu = item.parentElement.querySelector('[data-testid=action-menu]')
      const wasVisible = menu && menu.classList.contains('open')

      hideAllMenus()

      if (menu && !wasVisible) {
        menu.classList.add('open')
      }
    })
  )

  document.addEventListener('click', hideAllMenus)
}

//
// Project page
//

function addFriseHiddenContentToggleHandler() {
  const friseContentToggleShowItems = document.querySelectorAll(
    '[data-testid=frise-action].frise-content-toggle'
  )

  const allHiddenContentItems = document.querySelectorAll('[data-testId=frise-hidden-content]')

  friseContentToggleShowItems.forEach((friseContentToggleShow) =>
    friseContentToggleShow.addEventListener('click', function (event) {
      event.preventDefault()

      const hiddenContent = friseContentToggleShow.closest('[data-testId=frise-item]').nextSibling

      if (!hiddenContent || hiddenContent.getAttribute('data-testId') !== 'frise-hidden-content') {
        // Can't find it, ignore
        return
      }

      const wasHidden = hiddenContent.classList.contains('hidden')

      allHiddenContentItems.forEach((item) => item.classList.add('hidden'))

      hiddenContent.classList.toggle('hidden', !wasHidden)
    })
  )

  const friseContentToggleHideItems = document.querySelectorAll('[data-testid=frise-hide-content]')

  friseContentToggleHideItems.forEach((friseContentToggleHide) =>
    friseContentToggleHide.addEventListener('click', function (event) {
      event.preventDefault()

      const contentToBeHidden = friseContentToggleHide.closest('[data-testId=frise-hidden-content]')

      if (contentToBeHidden) {
        contentToBeHidden.classList.add('hidden')
      }
    })
  )
}

function addFriseToggleHandler() {
  const friseToggleShow = document.querySelector('[data-testid=frise-show-timeline]')

  if (friseToggleShow) {
    friseToggleShow.addEventListener('click', function (event) {
      event.preventDefault()

      document.querySelectorAll('.frise--collapsed').forEach((el) => {
        el.classList.remove('frise--collapsed')
        el.classList.add('frise--uncollapsed')
      })
    })
  }

  const friseToggleHide = document.querySelector('[data-testid=frise-hide-timeline]')

  if (friseToggleHide) {
    friseToggleHide.addEventListener('click', function (event) {
      event.preventDefault()

      document.querySelectorAll('.frise--uncollapsed').forEach((el) => {
        el.classList.add('frise--collapsed')
        el.classList.remove('frise--uncollapsed')
      })
    })
  }
}

function addInvitationHandlers() {
  const invitationFormShowButton = document.querySelector(
    '[data-testid=invitation-form-show-button]'
  )

  const invitationFormHideButton = document.querySelector(
    '[data-testid=invitation-form-hide-button]'
  )

  const invitationForm = document.querySelector('[data-testid=invitation-form]')

  if (invitationFormShowButton) {
    invitationFormShowButton.addEventListener('click', function (event) {
      event.preventDefault()

      toggleVisibility(invitationForm, true)
    })
  }

  if (invitationFormHideButton) {
    invitationFormHideButton.addEventListener('click', function (event) {
      event.preventDefault()

      toggleVisibility(invitationForm, false)
    })
  }
}

//
// Project List
//

function addGoToProjectPageHandlers() {
  const projectButtons = document.querySelectorAll('[data-goto-projectid]')
  projectButtons.forEach((item) =>
    item.addEventListener('click', function (event) {
      if (event.target.nodeName !== 'A' && event.target.nodeName !== 'INPUT') {
        event.preventDefault()

        const projectId = item.getAttribute('data-goto-projectid')

        if (projectId) {
          location.href = '/projet/' + projectId + '/details.html'
        }
      }
    })
  )

  // We want to ignore all clicks in the actions container (which might be inside the projectList-item area which has the click handler above)
  const actionsContainer = document.querySelectorAll('[data-testid=item-actions-container]')
  actionsContainer.forEach((item) =>
    item.addEventListener('click', function (event) {
      event.stopPropagation()
    })
  )
}

function addMotifEliminationToggleHandlers() {
  const motifToggle = document.querySelectorAll(
    '[data-testid=projectList-item-toggleMotifsElimination]'
  )

  motifToggle.forEach((item) =>
    item.addEventListener('click', function (event) {
      event.preventDefault()
      event.stopPropagation()

      const icon = item.querySelector('svg')
      const wasVisible = icon && icon.style.transform === 'rotate(180deg)'

      // Hide all motifs
      document
        .querySelectorAll('[data-testid=projectList-item-toggleMotifsElimination]')
        .forEach((item) => toggleMotifVisibilty(item, false))

      toggleMotifVisibilty(item, !wasVisible)
    })
  )
}

function addProjectListSelectionHandler() {
  const invitedProjectsList = document.querySelector('[data-testid=invitation-form-project-list]')

  const projectCheckboxes = document.querySelectorAll('[data-testid=projectList-item-checkbox]')

  const selectAllCheckbox = document.querySelector('[data-testid=projectList-selectAll-checkbox]')

  const checkboxColumns = document.querySelectorAll('[data-testid=projectList-checkbox]')

  const invitationFormVisibilityToggle = document.querySelector(
    '[data-testid=projectList-invitation-form-visibility-toggle]'
  )

  if (invitationFormVisibilityToggle) {
    invitationFormVisibilityToggle.addEventListener('click', function (event) {
      event.preventDefault()

      const wasVisible = invitationFormVisibilityToggle.classList.contains('open')

      toggleVisibility(invitationFormVisibilityToggle, !wasVisible)

      checkboxColumns.forEach((item) => (item.style.display = wasVisible ? 'none' : ''))
    })
  }

  const invitationSubmitButton = document.querySelector('[data-testid=invitation-submit-button]')

  function updateAccessFormVisibility() {
    if (invitedProjectsList && invitationSubmitButton) {
      if (invitedProjectsList.options.length) {
        invitationSubmitButton.disabled = false
      } else {
        invitationSubmitButton.disabled = true
      }
    }
  }

  function findOption(options, value) {
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === value) return options[i]
    }
  }

  function toggleProjectInList(projectId, isSelected) {
    if (invitedProjectsList) {
      const projectOption = findOption(invitedProjectsList.options, projectId)
      if (isSelected && !projectOption) {
        invitedProjectsList.options.add(new Option(projectId, projectId, true, true))
      }

      if (!isSelected && projectOption) {
        projectOption.remove()
      }
    }

    updateAccessFormVisibility()
  }

  function toggleProjectBox(item, isSelected) {
    const projectId = item.getAttribute('data-projectid')

    item.checked = isSelected

    toggleProjectInList(projectId, isSelected)
  }

  projectCheckboxes.forEach((item) =>
    item.addEventListener('change', function (event) {
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = false
      }

      toggleProjectBox(item, event.target.checked)
    })
  )

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function (event) {
      projectCheckboxes.forEach((item) => toggleProjectBox(item, event.target.checked))
    })
  }
}

function toggleMotifVisibilty(toggleItem, shouldBeVisible) {
  const parent = toggleItem.closest('[data-testid=projectList-item]')

  if (parent) {
    const motifs = parent.querySelector('[data-testid=projectList-item-motifsElimination]')

    if (motifs) {
      // Display this motif
      motifs.style.display = shouldBeVisible ? 'block' : 'none'

      // reverse the expand icon
      const icon = toggleItem.querySelector('svg')
      if (icon) {
        icon.style.transform = shouldBeVisible ? 'rotate(180deg)' : 'rotate(0deg)'
      }
    }
  }
}

//
// Pagination handlers
//

function addPaginationHandler() {
  const pageSizeSelectField = document.querySelector('[data-testid=pageSizeSelector]')

  if (pageSizeSelectField) {
    pageSizeSelectField.addEventListener('change', function (event) {
      updateFieldsInUrl({ pageSize: event.target.value, page: 0 })
    })
  }

  const goToPageButtons = document.querySelectorAll('[data-testid=goToPage]')

  goToPageButtons.forEach((item) =>
    item.addEventListener('click', function (event) {
      event.preventDefault()
      const pageValue = event.target.getAttribute('data-pagevalue')

      updateFieldInUrl('page', pageValue)
    })
  )
}

//
// AO/Periode selector handler
//

function updateFieldsInUrl(fields) {
  // Update the URL with the new appel offre Id or periode Id
  const queryString = new URLSearchParams(window.location.search)

  Object.entries(fields).forEach(([key, value]) => {
    if (value === null) queryString.delete(key)
    else queryString.set(key, value)
  })

  // We are going to change page so remove error and success messages
  queryString.delete('error')
  queryString.delete('success')

  window.location.replace(
    window.location.origin + window.location.pathname + '?' + queryString.toString()
  )
}

function updateFieldInUrl(field, value) {
  updateFieldsInUrl({ [field]: value })
}

function addSelectorHandlers() {
  ;[
    'appelOffreId',
    'periodeId',
    'familleId',
    'beforeDate',
    'garantiesFinancieres',
    'classement',
  ].forEach((key) => {
    const selectField = document.querySelector('[data-testid=' + key + 'Selector]')
    if (selectField) {
      selectField.addEventListener('change', function (event) {
        if (key === 'appelOffreId') {
          updateFieldsInUrl({
            appelOffreId: event.target.value,
            periodeId: null,
            familleId: null,
          })
        } else {
          updateFieldInUrl(key, event.target.value)
        }
      })
    }
  })

  document.querySelectorAll('[data-testid=resetSelectors]').forEach((item) =>
    item.addEventListener('click', function (event) {
      event.preventDefault()

      window.location.replace(window.location.origin + window.location.pathname)

      return false
    })
  )
}

function addSendCopyOfNotificationButtonHandler() {
  const sendCopyButtons = document.querySelectorAll('[data-actionid=send-copy-of-notification]')

  if (sendCopyButtons) {
    sendCopyButtons.forEach((item) =>
      item.addEventListener('click', function (event) {
        // event.stopPropagation()
        event.preventDefault()
        const link = event.target.getAttribute('href')

        if (!link) {
          console.log('Cannot call send copy because missing  link', link)
          return
        }

        fetch(link).then((response) => {
          if (response.ok) {
            alert('Une copie de la notification de ce candidat a été envoyée à votre adresse email')
          } else {
            console.log('GET to send copy of candidate notification failed', response.error)
            alert("L'envoi de copie de notification a échoué.")
          }
        })

        return false
      })
    )
  } else {
  }
}

//
// Puissance modification Page
//

function addPuissanceModificationHandler() {
  const newPuissanceField = document.querySelector(
    '[data-testid=modificationRequest-puissanceField]'
  )

  if (newPuissanceField) {
    var submitButton = '[data-testid=submit-button]'

    newPuissanceField.addEventListener('keyup', function (event) {
      var newValue = Number(event.target.value)

      var oldValue = getFieldValue('[data-testid=modificationRequest-presentPuissanceField]')

      var outOfBounds = '[data-testid=modificationRequest-puissance-error-message-out-of-bounds]'
      var wrongFormat = '[data-testid=modificationRequest-puissance-error-message-wrong-format]'

      if (!Number.isNaN(newValue) && !Number.isNaN(oldValue)) {
        console.log('Both are number')
        if (newValue > oldValue || newValue / oldValue < 0.9) {
          show(outOfBounds, true)
          show(wrongFormat, false)
        } else {
          show(outOfBounds, false)
          show(wrongFormat, false)
        }
        disable(submitButton, false)
      } else {
        disable(submitButton, true)
        show(outOfBounds, false)
        show(wrongFormat, true)
      }
    })
  }
}

//
// Delay request Page
//

function getDateFromDateString(str) {
  // For a date in the DD/MM/YYYY format
  var day = Number(str.substring(0, 2))
  var month = Number(str.substring(3, 5))
  var year = Number(str.substring(6))

  return new Date(year, month - 1, day)
}

var dateRegex = new RegExp(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/)

function addDelayDateModificationHandler() {
  const delayedServiceDateField = document.querySelector(
    '[data-testid=modificationRequest-delayedServiceDateField]'
  )

  if (delayedServiceDateField) {
    var submitButton = '[data-testid=submit-button]'

    delayedServiceDateField.addEventListener('keyup', function (event) {
      var oldDate = getDateFromDateString(
        getFieldValue('[data-testid=modificationRequest-presentServiceDateField]')
      )

      var newDateStr = getFieldValue('[data-testid=modificationRequest-delayedServiceDateField]')

      var outOfBounds = '[data-testid=modificationRequest-delay-error-message-out-of-bounds]'
      var wrongFormat = '[data-testid=modificationRequest-delay-error-message-wrong-format]'

      if (newDateStr.length < 6) {
        // Ignore, user is still typing
        return
      }

      if (!dateRegex.test(newDateStr)) {
        disable(submitButton, true)
        show(outOfBounds, false)
        show(wrongFormat, true)
      } else {
        // Date is valid format
        var newDate = getDateFromDateString(newDateStr)

        if (newDate.getTime() <= oldDate.getTime()) {
          // Date is before old date
          disable(submitButton, true)
          show(outOfBounds, true)
          show(wrongFormat, false)
        } else {
          // all good
          show(outOfBounds, false)
          show(wrongFormat, false)
          disable(submitButton, false)
        }
      }
    })
  }
}

//
// Validated date fields
//

function addDateValidationHandler() {
  const dateFields = document.querySelectorAll('[data-testid=date-field]')

  dateFields.forEach((dateField) => {
    console.log('Found dateField', dateField)
    const lowerBound = dateField.getAttribute('data-min-date')
    const upperBound = dateField.getAttribute('data-max-date')

    if (lowerBound || upperBound) {
      console.log('Found lower/upperBound')
      // This field needs validation

      const submitButton = dateField.closest('form').querySelector('[data-testid=submit-button]')

      const outOfBounds = dateField
        .closest('form')
        .querySelector('[data-testid=error-message-out-of-bounds]')

      const wrongFormat = dateField
        .closest('form')
        .querySelector('[data-testid=error-message-wrong-format]')

      dateField.addEventListener('keyup', function (event) {
        console.log('dateField keyup')
        const newDateStr = dateField.value

        if (newDateStr.length < 6) {
          // Ignore, user is still typing
          return
        }

        if (!dateRegex.test(newDateStr)) {
          disableButton(submitButton, true)
          showElement(outOfBounds, false)
          showElement(wrongFormat, true)
        } else {
          // Date is valid format
          var newDate = getDateFromDateString(newDateStr)

          if (
            (lowerBound && newDate.getTime() <= lowerBound) ||
            (upperBound && newDate.getTime() >= upperBound)
          ) {
            // Date is lower than lower bound or higher than upper bound
            disableButton(submitButton, true)
            showElement(outOfBounds, true)
            showElement(wrongFormat, false)
          } else {
            // all good
            showElement(outOfBounds, false)
            showElement(wrongFormat, false)
            disableButton(submitButton, false)
          }
        }
      })
    }
  })
}

//
// General utility
//

function addConfirmHandlers() {
  const confirmableLinks = document.querySelectorAll('[data-confirm]')

  confirmableLinks.forEach((item) =>
    item.addEventListener('click', function (event) {
      if (!confirm(item.getAttribute('data-confirm'))) event.preventDefault()
    })
  )
}

function addVisibilityToggleHandler() {
  const sectionToggle = document.querySelectorAll('[data-testid=visibility-toggle]')

  sectionToggle.forEach((item) =>
    item.addEventListener('click', function (event) {
      event.preventDefault()

      const wasVisible = item.classList.contains('open')

      toggleVisibility(item, !wasVisible)
    })
  )
}

function toggleVisibility(toggleItem, shouldBeVisible) {
  if (shouldBeVisible) {
    toggleItem.classList.add('open')
  } else {
    toggleItem.classList.remove('open')
  }
}

function getFieldValue(selector) {
  var elem = document.querySelector(selector)

  if (elem) {
    return elem.value
  }
}

function showElement(element, isVisible) {
  if (element) {
    element.style.display = isVisible ? 'inherit' : 'none'
  }
}

function show(selector, isVisible) {
  var elem = document.querySelector(selector)

  showElement(elem, isVisible)
}

function disableButton(button, isDisabled) {
  if (button) {
    if (isDisabled) button.setAttribute('disabled', true)
    else button.removeAttribute('disabled')
  }
}

function disable(selector, isDisabled) {
  var elem = document.querySelector(selector)

  disableButton(elem, isDisabled)
}
