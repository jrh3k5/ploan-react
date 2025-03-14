import { ModalWrapper } from "./modal_wrapper";
import { useModalWindow } from "react-modal-global";

export function FAQModal() {
  const modal = useModalWindow();

  return (
    <ModalWrapper>
      <h1>FAQ</h1>
      <div>
        <div className="faq-question">What is this?</div>
        <div className="faq-answer">
          This is an application to help track the loaning of funds between
          friends. There is no interest collected and this app takes no revenue
          from the exchange of funds.
        </div>
      </div>
      <div>
        <div className="faq-question">Why should I use this?</div>
        <div className="faq-answer">
          This solves two problems:
          <ol>
            <li>Tracking the amount repaid and owed</li>
            <li>
              Protecting against accidentally sending the amount to the wrong
              person
            </li>
          </ol>
          This automates the administrivia of lending money to friends and
          prevents accidentally sending a repayment to the wrong address.
        </div>
      </div>
      <div>
        <div className="faq-question">
          Why can&apos;t I charge interest with loans on this app?
        </div>
        <div className="faq-answer">
          Because you shouldn&apos;t monetize spotting your friends some cash.
          That&apos;s weird.
        </div>
      </div>
      <div className="form-buttons">
        <button onClick={() => modal.close()}>Close</button>
      </div>
    </ModalWrapper>
  );
}
