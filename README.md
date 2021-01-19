# Balance test mod

This mod intends to be standalone and compatible with most other mods, and used to do some simple balance testing.
It provides features that help with that, hopefully.

In console, I recommend you autostart the balance map:
`-autostart="scenarios/bm_balance_test" -autostart-victory=endless`

## Documentation

See the [Wiki](https://github.com/wraitii/balance_test_mod/wiki).

## Dependencies

This mod still relies on:
- The presence of a 'model' shader
- The globalscripts functions: `MatchesClassList`, `GetIdentityClasses` and `GetTemplateDataHelper`
- The presence of the `Timer` component
- For the damage monitor, the `Attacked` message
