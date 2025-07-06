module 0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341::ClinicalDataSharing {

    use std::signer;
    use std::vector;
    use std::string;
    use std::option;

    /// Patient struct holds consent and data hash
    struct Patient has copy, drop, store {
        owner: address,
        consented_institutions: vector<address>,
        data_hash: string::String,
    }

    /// Access log struct
    struct AccessLog has copy, drop, store {
        patient: address,
        accessor: address,
        timestamp: u64,
        action: string::String,
    }

    /// Token balance for rewards
    struct TokenBalance has copy, drop, store {
        addr: address,
        tokens: u64,
    }

    /// Global state
    struct State has key {
        patients: vector<Patient>,
        logs: vector<AccessLog>,
        token_balances: vector<TokenBalance>,
    }

    /// Helper: find patient index by address
    fun find_patient_idx(patients: &vector<Patient>, addr: address): option::Option<u64> {
        find_patient_idx_helper(patients, addr, 0)
    }

    fun find_patient_idx_helper(patients: &vector<Patient>, addr: address, i: u64): option::Option<u64> {
        let len = vector::length(patients);
        if (i >= len) {
            option::none()
        } else {
            let p = vector::borrow(patients, i);
            if (p.owner == addr) {
                option::some(i)
            } else {
                find_patient_idx_helper(patients, addr, i + 1)
            }
        }
    }

    /// Helper: find token balance index by address
    fun find_token_idx(balances: &vector<TokenBalance>, addr: address): option::Option<u64> {
        find_token_idx_helper(balances, addr, 0)
    }

    fun find_token_idx_helper(balances: &vector<TokenBalance>, addr: address, i: u64): option::Option<u64> {
        let len = vector::length(balances);
        if (i >= len) {
            option::none()
        } else {
            let b = vector::borrow(balances, i);
            if (b.addr == addr) {
                option::some(i)
            } else {
                find_token_idx_helper(balances, addr, i + 1)
            }
        }
    }

    /// Helper: check if institution is in consented_institutions
    fun has_institution(consented: &vector<address>, institution: address): bool {
        has_institution_helper(consented, institution, 0)
    }

    fun has_institution_helper(consented: &vector<address>, institution: address, i: u64): bool {
        let len = vector::length(consented);
        if (i >= len) {
            false
        } else if (*vector::borrow(consented, i) == institution) {
            true
        } else {
            has_institution_helper(consented, institution, i + 1)
        }
    }

    /// Helper: remove institution from consented_institutions
    fun remove_institution(consented: &mut vector<address>, institution: address) {
        remove_institution_helper(consented, institution, 0)
    }

    fun remove_institution_helper(consented: &mut vector<address>, institution: address, i: u64) {
        let len = vector::length(consented);
        if (i >= len) {
            // do nothing
        } else if (*vector::borrow(consented, i) == institution) {
            vector::swap_remove(consented, i);
        } else {
            remove_institution_helper(consented, institution, i + 1)
        }
    }

    /// Helper: extract value from option::Option<u64>
    fun extract_option(opt: option::Option<u64>): u64 {
        // This function assumes opt is Some and will abort if None
        if (option::is_some(&opt)) {
            *option::borrow(&opt)
        } else {
            0 // or abort, depending on your logic
        }
    }

    /// Initialize state for the admin
    public entry fun init(admin: &signer) {
        let patients = vector::empty<Patient>();
        let token_balances = vector::empty<TokenBalance>();
        let logs = vector::empty<AccessLog>();
        move_to(admin, State {
            patients,
            logs,
            token_balances,
        });
    }

    /// Add a new patient with their data hash
    public entry fun add_patient(
        admin: &signer,
        patient_address: address,
        data_hash: string::String
    ) acquires State {
        let state = borrow_global_mut<State>(signer::address_of(admin));
        assert!(option::is_none(&find_patient_idx(&state.patients, patient_address)), 2);
        let empty_consent = vector::empty<address>();
        let new_patient = Patient {
            owner: patient_address,
            consented_institutions: empty_consent,
            data_hash,
        };
        vector::push_back(&mut state.patients, new_patient);
    }

    /// Grant access to an institution
    public entry fun grant_access(
        user: &signer,
        institution: address
    ) acquires State {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<State>(user_addr);
        let idx_opt = find_patient_idx(&state.patients, user_addr);
        assert!(option::is_some(&idx_opt), 3);
        let idx = extract_option(idx_opt);
        let patient = vector::borrow_mut(&mut state.patients, idx);
        if (!has_institution(&patient.consented_institutions, institution)) {
            vector::push_back(&mut patient.consented_institutions, institution);
        }
    }

    /// Revoke access from an institution
    public entry fun revoke_access(
        user: &signer,
        institution: address
    ) acquires State {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<State>(user_addr);
        let idx_opt = find_patient_idx(&state.patients, user_addr);
        assert!(option::is_some(&idx_opt), 4);
        let idx = extract_option(idx_opt);
        let patient = vector::borrow_mut(&mut state.patients, idx);
        remove_institution(&mut patient.consented_institutions, institution);
    }

    /// Log access events
    public entry fun log_access(
        user: &signer,
        patient: address,
        action: string::String
    ) acquires State {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<State>(user_addr);
        let log = AccessLog {
            patient,
            accessor: user_addr,
            timestamp: 0, // Use actual time source if available
            action,
        };
        vector::push_back(&mut state.logs, log);
    }

    /// Reward contributors
    public entry fun reward_contribution(
        admin: &signer,
        recipient: address,
        amount: u64
    ) acquires State {
        let state = borrow_global_mut<State>(signer::address_of(admin));
        let idx_opt = find_token_idx(&state.token_balances, recipient);
        if (option::is_some(&idx_opt)) {
            let idx = extract_option(idx_opt);
            let balance = vector::borrow_mut(&mut state.token_balances, idx);
            balance.tokens = balance.tokens + amount;
        } else {
            let new_balance = TokenBalance { addr: recipient, tokens: amount };
            vector::push_back(&mut state.token_balances, new_balance);
        }
    }

    /// View token balance (non-entry)
    public fun get_token_balance(addr: address): u64 acquires State {
        if (!exists<State>(addr)) {
            0
        } else {
            let idx_opt = find_token_idx(&borrow_global<State>(addr).token_balances, addr);
            if (option::is_some(&idx_opt)) {
                let idx = extract_option(idx_opt);
                vector::borrow(&borrow_global<State>(addr).token_balances, idx).tokens
            } else {
                0
            }
        }
    }
}
