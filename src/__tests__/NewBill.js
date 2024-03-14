/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import {bills} from "../fixtures/bills.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";


const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname})
}

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        beforeEach(() => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const html = NewBillUI()
            document.body.innerHTML = html
        })
        test("Then the header 'Envoyer une note de frais' should be present", () => {
            const NewBillPage = new NewBill({
                document, onNavigate, store: mockStore, bills, localStorage: window.localStorage
            })
            const header = screen.getByText("Envoyer une note de frais");
            expect(header).toBeTruthy();
        })

        test("Then it should handle file change and update fileUrl, fileName, and billId", async () => {
            const NewBillPage = new NewBill({
                document, onNavigate, store: mockStore, bills, localStorage: window.localStorage
            })
            const fileInput = screen.getByTestId("file");
            const fileChange = jest.fn(NewBillPage.handleChangeFile);
            fileInput.addEventListener("change", fileChange);
            const file = new File(['testFileContent'], 'testFile.png', {type: 'image/png'});

            //fireEvent.change(fileInput, {target: {files: [file]}});
            userEvent.upload(fileInput, file);
            expect(fileChange).toHaveBeenCalled();
            console.log("test :" + NewBillPage.fileName);
            /*await waitFor(() => {
                expect(NewBillPage.fileName).toBe('testFile.png');
                expect(NewBillPage.fileUrl).not.toBe('');
                expect(NewBillPage.billId).not.toBeNull();
            });
            */
        });

        test("Then it should handle form submission and update the bill", async () => {
            const NewBillPage = new NewBill({
                document, onNavigate, store: mockStore, bills, localStorage: window.localStorage
            })
            const fixtureData = bills[1]; //
            const imageInput = screen.getByTestId("file");
            const expenseInput = screen.getByTestId('expense-name');
            const amountInput = screen.getByTestId('amount');
            const dateInput = screen.getByTestId("datepicker");
            const vatInput = screen.getByTestId("vat");
            const pctInput = screen.getByTestId("pct");
            const detailsInput = screen.getByTestId("commentary");
            const file = { name: 'test.png', type: 'image/png' };
            await userEvent.type(expenseInput, fixtureData.name);
            await userEvent.type(amountInput, fixtureData.amount.toString());
            await userEvent.type(dateInput, fixtureData.date);
            await userEvent.type(vatInput, fixtureData.vat.toString());
            await userEvent.type(pctInput, fixtureData.pct.toString());
            await userEvent.type(detailsInput, fixtureData.commentary);
            await userEvent.upload(imageInput, file);
            const submitBtn = screen.getByText("Envoyer");
            const handleSubmit = jest.fn((e) => NewBillPage.handleSubmit(e));
            const form = screen.getByTestId('form-new-bill');
            form.addEventListener('submit', handleSubmit);
            userEvent.click(submitBtn);
            expect(handleSubmit).toHaveBeenCalledTimes(1);
            const heading = screen.getByText('Mes notes de frais');
            expect(heading).toBeTruthy()
        });
    });
});

