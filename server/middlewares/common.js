export default function validateEmail(email) {
  email = email.trim();

  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.split('@').length !== 2) {
    console.log("Email is invalid: Incorrect '@' symbol usage.");
    return false;
  }

  const localPart = email.split('@')[0];
  if (localPart.includes('..')) {
    console.log('Email is invalid: Consecutive dots found.');
    return false;
  }

  if (email.length > 254) {
    console.log('Email is invalid: Email is too long.');
    return false;
  }

  if (emailRegex.test(email)) {
    console.log('Email is valid.');
    return true;
  } else {
    console.log('Email is invalid: Does not match the regex.');
    return false;
  }
}
