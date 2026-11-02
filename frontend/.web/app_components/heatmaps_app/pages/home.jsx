
import {ReflexEvent,applyEventActions,getRefValue,getRefValues,isTrue,mergeSlotProps} from "$/utils/state"
import {Root as RadixFormRoot} from "@radix-ui/react-form"
import {addEvents} from "$/utils/context"
import {Fragment,memo,useCallback,useEffect} from "react"
import {jsx} from "@emotion/react"








export const Form_root_118906dd2214e8b6a960322740e59ef7_5134575e = /*#__PURE__*/ (() => {
const Form_root_118906dd2214e8b6a960322740e59ef7_5134575e = memo(({children, ...rest}) => {


    const handleSubmit_f01955de402a55f52e5adffe4cfdfa5a = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {
            ...Object.fromEntries(new FormData($form).entries()),
            ...({  })
        };

        (((...args) => (addEvents([(ReflexEvent("_call_function", ({ ["function"] : (() => null), ["callback"] : null }), ({ ["preventDefault"] : true })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })



    return(
        jsx(RadixFormRoot,{...mergeSlotProps(rest, ({ className:"Root ", css:({ ["width"] : "100%" }), onSubmit:handleSubmit_f01955de402a55f52e5adffe4cfdfa5a }))},children)
    )
});
Form_root_118906dd2214e8b6a960322740e59ef7_5134575e.displayName = "Form";
return Form_root_118906dd2214e8b6a960322740e59ef7_5134575e;
})();
