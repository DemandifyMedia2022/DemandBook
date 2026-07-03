// import { Request, Response } from 'express';

// // Mock GSTIN lookup — no DB access, so it sits outside repository/service layers.
// // Swap this for a real GST API integration later; the response shape should stay the same
// // so the frontend autofill logic doesn't need to change.
// export const fetchGSTIN = async (req: Request, res: Response) => {
//     const { gstin } = req.params;

//     if (!gstin) {
//         return res.status(400).json({ success: false, message: 'GSTIN is required.' });
//     }

//     try {
//         // Simulate API delay
//         await new Promise((resolve) => setTimeout(resolve, 800));

//         if (gstin.length !== 15) {
//             return res.status(400).json({ success: false, message: 'Invalid GSTIN length. Must be 15 characters.' });
//         }

//         const stateCode = gstin.substring(0, 2);
//         const indianStates: Record<string, string> = {
//             "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
//             "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
//             "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
//             "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
//             "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
//             "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
//             "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
//             "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
//         };

//         const stateName = indianStates[stateCode] || "Maharashtra";
//         const placeOfSupply = `${stateCode}-${stateName}`;
//         const pan = gstin.substring(2, 12).toUpperCase();

//         const mockResponse = {
//             success: true,
//             data: {
//                 company_name: 'Acme Industrial Solutions Private Limited',
//                 display_name: 'Acme Industrial Solutions',
//                 pan: pan,
//                 customer_type: 'Business',
//                 gst_treatment: 'Registered Business - Regular',
//                 primary_contact_salutation: 'Mr.',
//                 primary_contact_first_name: 'Rohan',
//                 primary_contact_last_name: 'Deshmukh',
//                 place_of_supply: placeOfSupply,
//                 tax_preference: 'Taxable',
//                 email: 'billing@acmeindustrial.com',
//                 work_phone: '022-25874130',
//                 mobile_phone: '9820012345',
//                 vendor_language: 'English',
//                 currency: 'INR',
//                 payment_terms: 'Net 30',
//                 address: {
//                     billing: {
//                         attention: 'Accounts Manager',
//                         country: 'India',
//                         street1: 'Plot No. 12, Sector 5, Industrial Area',
//                         street2: 'Opposite Railway Station',
//                         city: stateCode === '27' ? 'Mumbai' : 'New Delhi',
//                         state: stateName,
//                         pin_code: stateCode === '27' ? '400705' : '110001',
//                         phone: '022-25874130',
//                         fax: '022-25874131'
//                     },
//                     shipping: {
//                         attention: 'Store In-charge',
//                         country: 'India',
//                         street1: 'Warehouse Block B, Sector 5, Industrial Area',
//                         street2: 'Opposite Railway Station',
//                         city: stateCode === '27' ? 'Mumbai' : 'New Delhi',
//                         state: stateName,
//                         pin_code: stateCode === '27' ? '400705' : '110001',
//                         phone: '9820012345',
//                         fax: ''
//                     }
//                 },
//                 bank_details: {
//                     bank_name: 'HDFC Bank',
//                     account_number: '50200045612398',
//                     ifsc_code: 'HDFC0000123',
//                     branch: 'Industrial Area Branch'
//                 },
//                 msme_registered: true,
//                 tds: 'TDS-194C (1.0%)'
//             }
//         };

//         return res.status(200).json(mockResponse);
//     } catch (error) {
//         console.error('Failed to fetch GSTIN:', error);
//         return res.status(500).json({ success: false, message: 'Error fetching GSTIN details.' });
//     }
// };


import { Request, Response } from 'express';

// Mock GSTIN lookup — no DB access, so it sits outside repository/service layers.
// Swap this for a real GST API integration later; keep the response shape the same
// so the frontend autofill logic doesn't need to change.
export const fetchGSTIN = async (req: Request, res: Response) => {
    const { gstin } = req.params;

    if (!gstin) {
        return res.status(400).json({ success: false, message: 'GSTIN is required.' });
    }

    try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (gstin.length !== 15) {
            return res.status(400).json({ success: false, message: 'Invalid GSTIN length. Must be 15 characters.' });
        }

        const stateCode = gstin.substring(0, 2);
        const indianStates: Record<string, string> = {
            "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
            "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
            "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
            "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
            "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
            "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
            "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
            "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
        };

        const stateName = indianStates[stateCode] || "Maharashtra";
        const placeOfSupply = `${stateCode}-${stateName}`;
        const pan = gstin.substring(2, 12).toUpperCase();

        const mockResponse = {
            success: true,
            data: {
                company_name: 'Acme Industrial Solutions Private Limited',
                display_name: 'Acme Industrial Solutions',
                pan: pan,
                customer_type: 'Business',
                gst_treatment: 'Registered Business - Regular',
                primary_contact_salutation: 'Mr.',
                primary_contact_first_name: 'Rohan',
                primary_contact_last_name: 'Deshmukh',
                place_of_supply: placeOfSupply,
                tax_preference: 'Taxable',
                email: 'billing@acmeindustrial.com',
                work_phone: '022-25874130',
                mobile_phone: '9820012345',
                vendor_language: 'English',
                currency: 'INR',
                payment_terms: 'Net 30',
                address: {
                    billing: {
                        attention: 'Accounts Manager',
                        country: 'India',
                        street1: 'Plot No. 12, Sector 5, Industrial Area',
                        street2: 'Opposite Railway Station',
                        city: stateCode === '27' ? 'Mumbai' : 'New Delhi',
                        state: stateName,
                        pin_code: stateCode === '27' ? '400705' : '110001',
                        phone: '022-25874130',
                        fax: '022-25874131'
                    },
                    shipping: {
                        attention: 'Store In-charge',
                        country: 'India',
                        street1: 'Warehouse Block B, Sector 5, Industrial Area',
                        street2: 'Opposite Railway Station',
                        city: stateCode === '27' ? 'Mumbai' : 'New Delhi',
                        state: stateName,
                        pin_code: stateCode === '27' ? '400705' : '110001',
                        phone: '9820012345',
                        fax: ''
                    }
                },
                bank_details: {
                    bank_name: 'HDFC Bank',
                    account_number: '50200045612398',
                    ifsc_code: 'HDFC0000123',
                    branch: 'Industrial Area Branch'
                },
                msme_registered: true,
                tds: 'TDS-194C (1.0%)'
            }
        };

        return res.status(200).json(mockResponse);
    } catch (error) {
        console.error('Failed to fetch GSTIN:', error);
        return res.status(500).json({ success: false, message: 'Error fetching GSTIN details.' });
    }
};