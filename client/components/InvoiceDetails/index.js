import CustomTable from "../CustomTable";
import Image from "next/image";
import logo from "../../public/assets/images/Mindbridge_logo.svg";
const InvoiceDetail = ({ selectedInvoice }) => {
  const updateData = selectedInvoice?.services;

  const columns = [
    {
      name: "ITEM DESCRIPTIONS",
      selector: (row) => row.service,
    },
    {
      name: "UNIT PRICE",
      selector: (row) => row.unitPrice,
    },
    {
      name: "QTY",
      selector: (row) => row.quantity,
    },
    {
      name: "TOTAL",
      selector: (row) => row.total,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%" }}>
          <div className="title-agreement">
            <h2 style={{ margin: "0px 0px 7px 0px" }}>Agreement</h2>
            <div>Payment Terms Agreement.</div>
          </div>
          <hr />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
            className="title-details"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div>Invoice To</div>
                <div style={{ fontWeight: "bold" }}>
                  {selectedInvoice?.patientName}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>Date</div>
                <div>{selectedInvoice?.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "65%" }}>{selectedInvoice?.address}</div>
              <div>
                <div style={{ fontWeight: "bold" }}>Issue</div>
                <div>{selectedInvoice?.invoiceDate}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: "30%", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              margin: "0px 0px 0px 0px",
              fontSize: "60px",
              fontWeight: "300",
            }}
          >
            INVOICE
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Account No</div>
            <div>{selectedInvoice?.accountNo}</div>
          </div>
          <div style={{ marginTop: "30px" }}>
            <div style={{ fontWeight: "bold" }}>TOTAL DUE</div>
            <div>${selectedInvoice?.totalAmount}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <CustomTable columns={columns} data={updateData} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ fontWeight: "bold" }}>Customer Message</div>
            <div>Hello,</div>
            <div>
              Thank you for your purchase.Please return this invoice with
              payments
            </div>
            <div>Thanks!</div>
          </div>
          <Image src={logo} />
        </div>
        <div>
          <div style={{ display: "flex", gap: "300px", margin: "10px 0px" }}>
            <div>SubTotal</div>
            <div>${selectedInvoice?.totalAmount}</div>
          </div>
          <div style={{ display: "flex", gap: "300px", margin: "10px 0px" }}>
            <div>Sales tax</div>
            <div>$100.00</div>
          </div>
          <div style={{ display: "flex", gap: "300px", margin: "10px 0px" }}>
            <div>Shipping</div>
            <div>$20.00</div>
          </div>
          <hr />
          <div
            style={{
              display: "flex",
              gap: "300px",
              margin: "10px 0px",
              fontWeight: "bold",
              fontSize: "22px",
            }}
          >
            <div>Total</div>
            <div>${Number(selectedInvoice?.totalAmount) + 100 + 20}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvoiceDetail;
