import React, { useState, useEffect } from 'react';
import { Redirect } from "react-router-dom";
import Joi from 'joi-browser';
import { useDispatch, useSelector } from "react-redux";
import { loadInvoices, createInvoice, updateInvoice } from "../../store/invoices";
import { loadInvoiceTaxes } from "../../store/invoiceTaxes";
import Spinner from '../Spinner/Spinner';
import Form from '../Forms/Form';
import InvoiceFormHeader from './InvoiceFormHeader';
import InvoiceFormBody from './InvoiceFormBody';
import InvoiceFormFooter from './InvoiceFormFooter';
import InvoiceTotal from './InvoiceTotal';

const InvoicesForm = ({ history, match }) => {
    const dispatch = useDispatch();
    const allInvoices = useSelector(state => state.entities.invoices.data);
    const invoiceTaxes = useSelector(state => state.entities.invoiceTaxes.data);
    const [invoiceId] = useState(match.params.id);
    const [data, setdata] = useState({
        id: "",
        reference: "",
        status: "DRAFT",
        notes: "",
        contact: {
            businessName: ""
        },
        invoiceItems: [
            {
                description: "",
                order: 1,
                price: 0,
                quantity: 1,
                taxAmount: 0,
            }
        ],
        contactId: "",
        created: (new Date().toString()),
        due: (new Date(new Date().setDate(new Date().getDate() + 7))).toString(),
        paid: "",
        taxInclusive: true
    });
    const [errors, setErrors] = useState({
        id: null,
        reference: null,
        status: null,
        notes: null,
        invoiceItems: [
            {
                description: null,
                order: null,
                price: null,
                quantity: null,
                taxAmount: null,
            }
        ],
        contact: {
            businessName: null
        },
        contactId: null,
        created: null,
        due: null,
        paid: null,
        taxInclusive: null,
        invoiceTaxes: null
    });

    const newUrl = 'new';
    const count = allInvoices.length;

    useEffect(() => {
        dispatch(loadInvoices());
        dispatch(loadInvoiceTaxes());

        if (invoiceTaxes.length > 0) {
            let initialData = JSON.parse(JSON.stringify(data));
            initialData.invoiceItems[0].invoiceTaxId = invoiceTaxes[0].id;
            setdata({
                ...initialData,
            });
        } else if (invoiceId === newUrl) {
            return;
        }
        const invoice = allInvoices.find(c => c.id === parseInt(invoiceId));
        if (!invoice) return;
        setdata({
            ...invoice,
            contactId: invoice.contact.id       
        });
      }, [allInvoices, invoiceTaxes, invoiceId, dispatch]);

    const schema = {
        reference: Joi.string().allow(null, '').label('Reference'),
        status: Joi.string().label('Status'),
        invoiceItems: Joi.array()
        .items({
            description: Joi.string().allow(null, ''),
            order: Joi.number(),
            price: Joi.number(),
            quantity: Joi.number(),
            taxAmount: Joi.number(),
            invoiceTaxId: Joi.number()
        }),
        contactId: Joi.number().required().error(() => {
            return {
              message: 'Contact is required.',
            }
          }),
        created: Joi.string().label('Date'),
        due: Joi.string().label('Due'),
        paid: Joi.string().allow(null, '').label('Paid'),
        notes: Joi.string().allow(null, '').label('Notes'),
        taxInclusive: Joi.boolean()
    };

    const handleChange = e => {
        const formInput = JSON.parse(JSON.stringify(data));
        formInput[e.target.name] = e.target.value;
        setdata(formInput);
    }

    const handleSubmission = e => {
        const submitType = e.nativeEvent.submitter.name;
        console.log(submitType);
        const formInput = JSON.parse(JSON.stringify(data));
        formInput.status = submitType.toUpperCase();
        setdata(formInput);

        if (invoiceId === newUrl) dispatch(createInvoice(formInput));
        else dispatch(updateInvoice(formInput));

        // history.push("/invoices");
    }

    const handleAddRepeatable = e => {
        e.preventDefault();
        const formInput = JSON.parse(JSON.stringify(data));

        let orderId = 1;
        if (formInput.invoiceItems.length > 0) orderId = formInput.invoiceItems[formInput.invoiceItems.length -1].order + 1;

        formInput.invoiceItems.push({
            id: 'new' + orderId,
            order: orderId,
            quantity: 0,
            price: 0,
            description: '',
            taxAmount: 0,
            taxPercentage: true,
            invoiceTaxId: invoiceTaxes.length > 0 ? invoiceTaxes[0].id : null
        });
        setdata(formInput);
    }

    if (count <= 0 && invoiceId !== newUrl) return <Spinner showText={false} />;
    if (count >= 1 && invoiceId !== newUrl && !allInvoices.find(c => c.id === parseInt(invoiceId))) return <Redirect to="/not-found" />;

    return (
        <>
            <h1 className="pb-3 pt-1">Invoice</h1>
            <Form 
                data={data}
                schema={schema}
                onError={setErrors}
                onSubmission={e => handleSubmission(e)}
            >
                <InvoiceFormHeader
                    data={data}
                    errors={errors}
                    onChange={handleChange}
                />
                <InvoiceFormBody
                    data={data.invoiceItems}
                    invoiceTaxes={invoiceTaxes}
                    errors={errors}
                    path="invoiceItems"
                    onChange={handleChange}
                    onAddRepeatable={handleAddRepeatable}
                />
                <InvoiceTotal 
                    data={data.invoiceItems}
                    taxInclusive={JSON.parse(data.taxInclusive)}
                />
                <InvoiceFormFooter
                    data={data}
                    errors={errors}
                    onChange={handleChange}
                />
                <div className="row">
                    <div className="col">
                        <button name="publish" className="btn btn-primary mt-2 mb-5 mr-2">Publish</button>
                        <button name="draft" className="btn btn-secondary mt-2 mb-5">Save Draft</button>
                    </div>
                </div>
            </Form>
        </>
    );
}

export default InvoicesForm;