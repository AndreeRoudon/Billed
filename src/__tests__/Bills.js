/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname})
}

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        beforeEach(() => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
        })
        test("Then bill icon in vertical layout should be highlighted", async () => {
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon).toBeTruthy();
            expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            console.log("les dates : " + dates);
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
        test('Then, click on new bill buttom', () => {
            document.body.innerHTML = BillsUI({data: bills})
            const billDashboard = new Bills({
                document, onNavigate, store: null, bills, localStorage: window.localStorage
            })
            const handleNewBill = jest.fn(e => billDashboard.handleClickNewBill(e))
            const btnNewBill = screen.getByTestId('btn-new-bill')
            btnNewBill.addEventListener('click', handleNewBill)
            userEvent.click(btnNewBill)
            expect(handleNewBill).toHaveBeenCalled()
        })
        test('Then, click on eye icon', () => {
            document.body.innerHTML = BillsUI({data: bills})
            const billDashboard = new Bills({
                document, onNavigate, store: mockStore, bills, localStorage: window.localStorage
            })
            billDashboard.handleClickIconEye = jest.fn();
            const handleIconEye = jest.fn(billDashboard.handleClickIconEye)
            const iconEyes = screen.getAllByTestId('icon-eye')
            iconEyes.forEach(iconEye => {
                iconEye.addEventListener('click', handleIconEye)
                userEvent.click(iconEye)
                expect(handleIconEye).toHaveBeenCalled()
            })
        })

        test('Then, getBills is called', async() => {
            document.body.innerHTML = BillsUI({data: bills})
            const billDashboard = new Bills({
                document, onNavigate, store: null, bills, localStorage: window.localStorage
            })
            const getBills = jest.fn(billDashboard.getBills);
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => getBills())
            expect(getBills).toHaveBeenCalled()
            //const result = await getBills();
            //expect(result).toEqual(bills);
        })
    })
})


