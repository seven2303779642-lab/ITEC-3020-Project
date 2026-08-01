/* ==========================================================================
   Contact form validation and simulated success state
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  const successPanel = document.querySelector('#form-success');
  const resetButton = document.querySelector('#send-another-message');

  if (!form || !successPanel) {
    return;
  }

  const fields = {
    name: {
      control: document.querySelector('#contact-name'),
      error: document.querySelector('#contact-name-error'),
      validate(value) {
        return value.trim() ? '' : 'Enter your name.';
      },
    },
    email: {
      control: document.querySelector('#contact-email'),
      error: document.querySelector('#contact-email-error'),
      validate(value) {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return 'Enter your email address.';
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
          ? ''
          : 'Enter a valid email address, such as name@example.com.';
      },
    },
    subject: {
      control: document.querySelector('#contact-subject'),
      error: document.querySelector('#contact-subject-error'),
      validate(value) {
        return value.trim() ? '' : 'Enter a subject.';
      },
    },
    messageType: {
      control: document.querySelector('#contact-message-type'),
      error: document.querySelector('#contact-message-type-error'),
      validate() {
        return form.querySelector('input[name="message-type"]:checked')
          ? ''
          : 'Choose a message type.';
      },
    },
    message: {
      control: document.querySelector('#contact-message'),
      error: document.querySelector('#contact-message-error'),
      validate(value) {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return 'Enter a message.';
        }

        return trimmedValue.length >= 20
          ? ''
          : `Add at least ${20 - trimmedValue.length} more character${20 - trimmedValue.length === 1 ? '' : 's'}.`;
      },
    },
  };

  function showError(field, message) {
    field.control.setAttribute('aria-invalid', 'true');
    field.error.textContent = message;
    field.error.hidden = false;
  }

  function clearError(field) {
    field.control.setAttribute('aria-invalid', 'false');
    field.error.textContent = '';
    field.error.hidden = true;
  }

  function getFieldValue(fieldName, field) {
    return fieldName === 'messageType' ? '' : field.control.value;
  }

  function validateField(fieldName) {
    const field = fields[fieldName];
    const message = field.validate(getFieldValue(fieldName, field));

    if (message) {
      showError(field, message);
      return false;
    }

    clearError(field);
    return true;
  }

  Object.entries(fields).forEach(([fieldName, field]) => {
    if (fieldName === 'messageType') {
      form.querySelectorAll('input[name="message-type"]').forEach((radio) => {
        radio.addEventListener('change', () => validateField(fieldName));
      });
      return;
    }

    field.control.addEventListener('input', () => {
      if (!field.error.hidden) {
        validateField(fieldName);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalidFields = Object.keys(fields).filter((fieldName) => !validateField(fieldName));

    if (invalidFields.length > 0) {
      const firstInvalidField = invalidFields[0];

      if (firstInvalidField === 'messageType') {
        form.querySelector('input[name="message-type"]').focus();
      } else {
        fields[firstInvalidField].control.focus();
      }
      return;
    }

    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  });

  resetButton?.addEventListener('click', () => {
    form.reset();
    Object.values(fields).forEach(clearError);
    successPanel.hidden = true;
    form.hidden = false;
    fields.name.control.focus();
  });
});
