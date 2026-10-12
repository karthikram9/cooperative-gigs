package com.gigplatform.welfare;

import com.gigplatform.booking.Booking;
import com.gigplatform.exception.BadRequestException;
import com.gigplatform.job.Job;
import com.gigplatform.payment.PaymentLedger;
import com.gigplatform.payment.PaymentRepository;
import com.gigplatform.payment.PaymentStatus;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WelfareServiceTest {

    @Mock
    private WelfareRepository welfareRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private UserService userService;
    @Mock
    private WorkerRepository workerRepository;

    private WelfareService welfareService;

    @BeforeEach
    void setUp() {
        welfareService = new WelfareService(
                welfareRepository,
                paymentRepository,
                userService,
                workerRepository,
                BigDecimal.valueOf(5)
        );
    }

    @Test
    void testCreateWelfareSuccess() {
        User customer = new User("Customer", "cust@test.com", "9000000001", "hash", UserRole.CUSTOMER);
        customer.setId(1L);

        Booking booking = new Booking();
        booking.setCustomer(customer);

        WorkerProfile worker = new WorkerProfile();
        ReflectionTestUtils.setField(worker, "id", 3L);

        Job job = new Job();
        job.setWorker(worker);

        PaymentLedger payment = new PaymentLedger();
        ReflectionTestUtils.setField(payment, "id", 10L);
        payment.setBooking(booking);
        payment.setJob(job);
        payment.setAmount(BigDecimal.valueOf(500));
        payment.setPaymentStatus(PaymentStatus.SUCCESS);

        when(userService.getUserByEmail("cust@test.com")).thenReturn(customer);
        when(paymentRepository.findDetailedById(10L)).thenReturn(Optional.of(payment));
        when(welfareRepository.existsByPaymentId(10L)).thenReturn(false);
        when(welfareRepository.save(any(WelfareTransaction.class))).thenAnswer(i -> {
            WelfareTransaction wt = i.getArgument(0);
            return wt;
        });

        var response = welfareService.create("cust@test.com", 10L);
        assertNotNull(response);
        assertEquals(new BigDecimal("25.00"), response.contributionAmount());
        assertEquals(new BigDecimal("5.00"), response.contributionPercentage());
    }

    @Test
    void testCreateWelfareFailsOnPendingPayment() {
        User customer = new User("Customer", "cust@test.com", "9000000001", "hash", UserRole.CUSTOMER);
        customer.setId(1L);

        Booking booking = new Booking();
        booking.setCustomer(customer);

        PaymentLedger payment = new PaymentLedger();
        ReflectionTestUtils.setField(payment, "id", 10L);
        payment.setBooking(booking);
        payment.setPaymentStatus(PaymentStatus.PENDING);

        when(userService.getUserByEmail("cust@test.com")).thenReturn(customer);
        when(paymentRepository.findDetailedById(10L)).thenReturn(Optional.of(payment));

        assertThrows(BadRequestException.class, () -> welfareService.create("cust@test.com", 10L));
    }
}