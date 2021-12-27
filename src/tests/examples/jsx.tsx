import {AppHistory} from "../../spec/app-history";
import {h, toString} from "@virtualstate/fringe";
import {EventTarget} from "../../event-target";
import {ok} from "../util";

const React = {
    createElement: h
}

export async function jsxExample(appHistory: AppHistory) {
    interface State {
        dateTaken?: string;
        caption?: string;
    }

    function Component({ caption, dateTaken }: State, input: unknown) {
        return h(
            "figure",
            {},
            h("date", {}, dateTaken),
            h("figcaption", {}, caption),
            input
        )
        // return (
        //     <figure>
        //         <date>{dateTaken}</date>
        //         <figcaption>{caption}</figcaption>
        //         {input}
        //     </figure>
        // )
    }

    const body: EventTarget & { innerHTML?: string } = new EventTarget();

    let bodyUpdated!: Promise<void>;

    appHistory.addEventListener("currentchange", async (event) => {
        await (event.transitionWhile ?? (promise => promise))(bodyUpdated = handler());
        async function handler() {
            body.innerHTML = await new Promise(
                (resolve, reject) => (
                    toString(<Component {...appHistory.current?.getState<State>() } />).then(
                        resolve,
                        reject
                    )
                )
            );
            console.log({ body: body.innerHTML });
        }
    });

    ok(!body.innerHTML);

    await appHistory.navigate('/', {
        state: {
            dateTaken: new Date().toISOString(),
            caption: `Photo taken on the date ${new Date().toDateString()}`
        }
    }).finished;

    // console.log(body.innerHTML);
    ok(bodyUpdated);
    await bodyUpdated;

    ok(body.innerHTML);

    const updatedCaption = `Photo ${Math.random()}`;

    ok(bodyUpdated);
    await bodyUpdated;
    ok(!body.innerHTML?.includes(updatedCaption));

    await appHistory.updateCurrent({
        state: {
            ...appHistory.current?.getState<State>(),
            caption: updatedCaption
        }
    })
        // Not all implementations have support for async resolution
        ?.finished;

    ok(bodyUpdated);
    await bodyUpdated;
    // This test will fail if async resolution is not supported.
    ok(body.innerHTML?.includes(updatedCaption));

}