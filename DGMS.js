// ==========================================
// Quality Issue Web Form Script (with Multi-Attach Fix)
// ==========================================

const CONFIG = {
    dealerField: 'custom_store__fofo_name',
    registrationField: 'custom_vehicle_registration_no',
    subjectField: 'subject',
    hideSubject: false,
    prefix: 'Quality Issue',
    childTableField: 'custom_technical_issue_categories',
    categoryField: 'technical_issue_category',
    subCategoryField: 'technical_issue_sub_category',
    photoField: 'photovideo_evidance', // Match the fieldname from your doctype
    mappingDoctype: 'Technical Issue Category Mapping',
    attachFields: ['custom_image_1', 'custom_image_2', 'custom_image_3']
};

// ==========================================
// Web Form Initialization
// ==========================================
frappe.web_form.after_load = () => {
    console.log("Web Form Loaded");
    
    // Create a MutationObserver to watch for modal creation
    const observer = new MutationObserver(function(mutations) {
        const modal = document.querySelector('.modal.show .file-uploader-dialog');
        if (modal) {
            handleFileUploader();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    function handleFileUploader() {
        setTimeout(function() {
            // Find the modal footer
            const modalFooter = document.querySelector('.modal.show .modal-footer');
            if (!modalFooter) return;
            
            // Hide "Set all private" button
            const buttons = modalFooter.querySelectorAll('.btn-link');
            buttons.forEach(function(btn) {
                if (btn.textContent.includes('Set all private')) {
                    btn.style.display = 'none';
                }
            });
            
            // Auto-click "Set all public" when files are added
            const fileList = document.querySelector('.modal.show .file-uploader-list');
            if (fileList) {
                const listObserver = new MutationObserver(function() {
                    const items = fileList.querySelectorAll('.file-upload-item');
                    if (items.length > 0) {
                        const setPublicBtn = Array.from(buttons).find(btn => 
                            btn.textContent.includes('Set all public')
                        );
                        if (setPublicBtn && !setPublicBtn.classList.contains('auto-clicked')) {
                            setPublicBtn.classList.add('auto-clicked');
                            setPublicBtn.click();
                        }
                    }
                });
                
                listObserver.observe(fileList, {
                    childList: true,
                    subtree: true
                });
            }
        }, 300);
    }

    if (CONFIG.hideSubject) {
        frappe.web_form.set_df_property(CONFIG.subjectField, 'hidden', 1);
        frappe.web_form.set_df_property(CONFIG.subjectField, 'read_only', 1);
    }

    generateSubject();
    load_technical_issue_categories();
    setup_child_table_category_listener();
    make_child_table_fields_mandatory();
};

// ==========================================
// Make Child Table Fields Mandatory
// ==========================================
function make_child_table_fields_mandatory() {
    setTimeout(() => {
        const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
        if (!child_table || !child_table.grid) {
            console.warn("Child table not ready yet.");
            return;
        }

        // Set fields as mandatory in the child table
        child_table.grid.update_docfield_property(CONFIG.categoryField, 'reqd', 1);
        child_table.grid.update_docfield_property(CONFIG.subCategoryField, 'reqd', 1);
        child_table.grid.update_docfield_property(CONFIG.photoField, 'reqd', 1);

        console.log("Child table fields marked as mandatory");
    }, 500);
}

// ==========================================
// Auto Subject Generator
// ==========================================
frappe.web_form.on(CONFIG.dealerField, generateSubject);
frappe.web_form.on(CONFIG.registrationField, generateSubject);

function generateSubject() {
    const dealer = frappe.web_form.get_value(CONFIG.dealerField) || '';
    const reg = frappe.web_form.get_value(CONFIG.registrationField) || '';
    let subject = CONFIG.prefix;

    if (dealer && reg) subject += ` - ${dealer} - ${reg}`;
    else if (dealer) subject += ` - ${dealer}`;
    else if (reg) subject += ` - ${reg}`;

    frappe.web_form.set_value(CONFIG.subjectField, subject);
}

// ==========================================
// Load Technical Issue Categories
// ==========================================
function load_technical_issue_categories() {
    frappe.call({
        method: 'drivex.api.public_list.public_get_list',
        args: {
            doctype: CONFIG.mappingDoctype,
            fields: ['technical_issue_category'],
            filters: [['technical_issue_category', '!=', '']],
            order_by: 'technical_issue_category asc',
            limit_page_length: 2000
        },
        callback: function (r) {
            if (r.message) {
                let unique_categories = [...new Set(r.message.map(d => d.technical_issue_category))].filter(Boolean);
                let category_options = ['', ...unique_categories].join('\n');
                
                frappe.web_form.fields_dict[CONFIG.childTableField].grid.update_docfield_property(
                    CONFIG.categoryField,
                    'options',
                    category_options
                );

                console.log("Loaded Categories:", unique_categories);
            }
        }
    });
}

// ==========================================
// Setup Dynamic Subcategory Updates
// ==========================================
function setup_child_table_category_listener() {
    setTimeout(() => {
        const child_table = frappe.web_form.fields_dict[CONFIG.childTableField];
        if (!child_table || !child_table.grid) {
            console.warn("Child table not ready yet.");
            return;
        }

        const grid_wrapper = $(child_table.grid.wrapper);

        grid_wrapper.on("change", `[data-fieldname='${CONFIG.categoryField}'] select, [data-fieldname='${CONFIG.categoryField}'] input`, function () {
            const grid_row = $(this).closest(".grid-row").data("grid_row");
            if (!grid_row || !grid_row.doc) return;

            const selected_category = grid_row.doc[CONFIG.categoryField];
            if (!selected_category) return;

            frappe.call({
                method: 'drivex.api.public_list.public_get_list',
                args: {
                    doctype: CONFIG.mappingDoctype,
                    fields: ['technical_issue_sub_category'],
                    filters: [
                        ['technical_issue_category', '=', selected_category],
                        ['technical_issue_sub_category', '!=', '']
                    ],
                    order_by: 'technical_issue_sub_category asc',
                    limit_page_length: 2000
                },
                callback: function (r) {
                    if (r.message && r.message.length > 0) {
                        let unique_subcategories = [...new Set(r.message.map(d => d.technical_issue_sub_category))].filter(Boolean);
                        let subcategory_options = ['', ...unique_subcategories].join('\n');

                        child_table.grid.update_docfield_property(
                            CONFIG.subCategoryField,
                            'options',
                            subcategory_options
                        );

                        grid_row.refresh_field(CONFIG.subCategoryField);
                        console.log(`Updated subcategories for ${selected_category}:`, unique_subcategories);
                    } else {
                        child_table.grid.update_docfield_property(CONFIG.subCategoryField, 'options', '');
                        grid_row.refresh_field(CONFIG.subCategoryField);
                    }
                }
            });
        });

        console.log("Child table category listener attached");
    }, 800);
}

// ==========================================
// Validation before submission
// ==========================================
frappe.web_form.validate = () => {
    const data = frappe.web_form.get_values();
    
    // Check subject
    if (!data.subject || data.subject.trim() === '') {
        frappe.msgprint({
            title: 'Missing Information',
            message: 'Subject could not be generated. Please fill in Dealer Name and Vehicle Registration Number.',
            indicator: 'red'
        });
        return false;
    }

    // Check child table has at least one row
    const child_data = data[CONFIG.childTableField];
    if (!child_data || child_data.length === 0) {
        frappe.msgprint({
            title: 'Missing Information',
            message: 'Please add at least one Issue Category.',
            indicator: 'red'
        });
        return false;
    }

    // Validate each row in child table
    for (let i = 0; i < child_data.length; i++) {
        const row = child_data[i];
        
        if (!row[CONFIG.categoryField]) {
            frappe.msgprint({
                title: 'Missing Information',
                message: `Row ${i + 1}: Issue Category is mandatory.`,
                indicator: 'red'
            });
            return false;
        }

        if (!row[CONFIG.subCategoryField]) {
            frappe.msgprint({
                title: 'Missing Information',
                message: `Row ${i + 1}: Issue Sub Category is mandatory.`,
                indicator: 'red'
            });
            return false;
        }

        if (!row[CONFIG.photoField]) {
            frappe.msgprint({
                title: 'Missing Information',
                message: `Row ${i + 1}: Photo/Video Evidence is mandatory.`,
                indicator: 'red'
            });
            return false;
        }
    }

    return true;
};