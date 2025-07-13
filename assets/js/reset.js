document.addEventListener("DOMContentLoaded", function () {
  // Toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);
      const icon = this.querySelector("i");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
    });
  });

  // Form elements
  const form = document.getElementById("resetPasswordForm");
  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");

  // Password validation regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Add input event listeners to clear validation when user starts typing
  [oldPassword, newPassword, confirmPassword].forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.classList.remove("is-invalid");
        document.getElementById(`${this.id}Feedback`).textContent = "";
      }
    });
  });

  // Add blur event listeners for immediate validation
  oldPassword.addEventListener("blur", validateOldPassword);
  newPassword.addEventListener("blur", validateNewPassword);
  confirmPassword.addEventListener("blur", validateConfirmPassword);

  function validateOldPassword() {
    if (!oldPassword.value.trim()) {
      document.getElementById("oldPasswordFeedback").textContent =
        "Current password is required";
      oldPassword.classList.add("is-invalid");
      return false;
    }
    oldPassword.classList.remove("is-invalid");
    return true;
  }

  function validateNewPassword() {
    if (!newPassword.value.trim()) {
      document.getElementById("newPasswordFeedback").textContent =
        "New password is required";
      newPassword.classList.add("is-invalid");
      return false;
    } else if (!passwordRegex.test(newPassword.value)) {
      document.getElementById("newPasswordFeedback").textContent =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
      newPassword.classList.add("is-invalid");
      return false;
    }
    newPassword.classList.remove("is-invalid");
    return true;
  }

  function validateConfirmPassword() {
    if (!confirmPassword.value.trim()) {
      document.getElementById("confirmPasswordFeedback").textContent =
        "Please confirm your new password";
      confirmPassword.classList.add("is-invalid");
      return false;
    } else if (confirmPassword.value !== newPassword.value) {
      document.getElementById("confirmPasswordFeedback").textContent =
        "Passwords do not match";
      confirmPassword.classList.add("is-invalid");
      return false;
    }
    confirmPassword.classList.remove("is-invalid");
    return true;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate all fields
    const isOldPasswordValid = validateOldPassword();
    const isNewPasswordValid = validateNewPassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isOldPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    // If validation passes, submit the form
    await submitResetPassword();
  });

  async function submitResetPassword() {
    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const submitSpinner = document.getElementById("submitSpinner");

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = "Processing...";
    submitSpinner.classList.remove("d-none");

    const authToken = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("oldPassword", oldPassword.value);
    formData.append("newPassword", newPassword.value);
    console.log("Form Data:", {
      token: authToken,
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });

    try {
      const response = await fetch(
        "https://dms.meshaenergy.com/apis/appusers/change-password",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        if (data.errFlag === 0) {
          showToast("Password changed successfully!", "success");
          form.reset();
        } else {
          let errorMessage = "Failed to change password";
          if (data.message) {
            errorMessage = data.message;
          } else if (data.errors) {
            errorMessage = Object.values(data.errors).join(", ");
          }
          showToast(errorMessage, "danger");

          // Highlight specific fields if needed
          //   if (data.errors?.oldPassword) {
          //     document.getElementById("oldPasswordFeedback").textContent =
          //       data.errors.oldPassword;
          //     oldPassword.classList.add("is-invalid");
          //   }
          //   if (data.errors?.newPassword) {
          //     document.getElementById("newPasswordFeedback").textContent =
          //       data.errors.newPassword;
          //     newPassword.classList.add("is-invalid");
          //   }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred. Please try again.", "danger");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitText.textContent = "Reset Password";
      submitSpinner.classList.add("d-none");
    }
  }

  function showToast(message, type) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toast.className = `toast text-white position-fixed top-0 end-0 m-3 show bg-${type}`;

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }
});
