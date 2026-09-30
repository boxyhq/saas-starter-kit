local claims = std.extVar('claims');

local firstName = if 'firstName' in claims && claims.firstName != null then claims.firstName else '';
local lastName = if 'lastName' in claims && claims.lastName != null then claims.lastName else '';
local fullName = std.stripChars(firstName + ' ' + lastName, ' ');
local name = if 'name' in claims && claims.name != null then claims.name else fullName;

{
  identity: {
    traits: {
      email: claims.email,
      [if name != '' then 'name' else null]: name,
    },
  },
}
